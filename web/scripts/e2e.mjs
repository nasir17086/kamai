// End-to-end test of the Kamai program against a running validator.
// Usage: node scripts/e2e.mjs [rpcUrl]   (default http://127.0.0.1:8899)
import anchor from "@coral-xyz/anchor";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount, mintTo, getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { readFileSync } from "node:fs";

const { AnchorProvider, BN, Program, Wallet } = anchor;
const idl = JSON.parse(readFileSync(new URL("../src/idl/kamai.json", import.meta.url)));
const conn = new Connection(process.argv[2] ?? "http://127.0.0.1:8899", "confirmed");
const PID = new PublicKey(idl.address);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (name, ok, extra = "") => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"}  ${name} ${extra}`); };
async function expectErr(name, p, code) {
  try { await p; check(name, false, "(no error)"); }
  catch (e) { const m = String(e?.message ?? e) + JSON.stringify(e?.logs ?? ""); check(name, m.includes(code), m.includes(code) ? "" : m.slice(0, 300)); }
}

const payer = Keypair.generate(), client = Keypair.generate(), freelancer = Keypair.generate();
for (const k of [payer, client, freelancer]) await conn.confirmTransaction(await conn.requestAirdrop(k.publicKey, 2 * LAMPORTS_PER_SOL));
const mint = await createMint(conn, payer, payer.publicKey, null, 6);
const clientAta = await getOrCreateAssociatedTokenAccount(conn, payer, mint, client.publicKey);
await mintTo(conn, payer, mint, clientAta.address, payer, 1000_000000n);

const prog = (kp) => new Program(idl, new AnchorProvider(conn, new Wallet(kp), { commitment: "confirmed" }));
const pc = prog(client), pf = prog(freelancer);
const bal = async (owner) => { try { return Number((await getAccount(conn, getAssociatedTokenAddressSync(mint, owner, true))).amount) / 1e6; } catch { return 0; } };
const escrowOf = (id) => PublicKey.findProgramAddressSync([Buffer.from("escrow"), client.publicKey.toBuffer(), freelancer.publicKey.toBuffer(), id.toArrayLike(Buffer, "le", 8)], PID)[0];
const now = () => Math.floor(Date.now() / 1000);
const accts = { client: client.publicKey, freelancer: freelancer.publicKey, mint, tokenProgram: TOKEN_PROGRAM_ID };

const fund = (id, amt, deadline, title = "Logo design") =>
  pc.methods.fund(id, new BN(amt * 1e6), new BN(deadline), title).accounts(accts).rpc();

// 1. fund + release
const id1 = new BN(1);
await fund(id1, 100, now() + 3600);
check("fund moves 100 USDC into vault", (await bal(client.publicKey)) === 900 && (await bal(escrowOf(id1))) === 100);
const e1 = await pc.account.escrow.fetch(escrowOf(id1));
check("escrow stores title/amount/status", e1.title === "Logo design" && e1.amount.toNumber() === 100e6 && e1.status === 0);
await expectErr("freelancer cannot release", pf.methods.release().accountsPartial({ ...accts, escrow: escrowOf(id1), signer: freelancer.publicKey }).rpc(), "Unauthorized");
await pc.methods.release().accountsPartial({ ...accts, escrow: escrowOf(id1), signer: client.publicKey }).rpc();
check("release pays freelancer 100", (await bal(freelancer.publicKey)) === 100);
check("status = Released", (await pc.account.escrow.fetch(escrowOf(id1))).status === 1);
await expectErr("cannot fund same invoice twice", fund(id1, 5, now() + 3600), "already in use");

// 2. freelancer cancels -> refund
const id2 = new BN(2);
await fund(id2, 50, now() + 3600);
await expectErr("client cannot refund before deadline", pc.methods.refund().accountsPartial({ ...accts, escrow: escrowOf(id2), signer: client.publicKey }).rpc(), "RefundNotAllowed");
await pf.methods.refund().accountsPartial({ ...accts, escrow: escrowOf(id2), signer: freelancer.publicKey }).rpc();
check("freelancer cancel refunds client", (await bal(client.publicKey)) === 900);
await expectErr("cannot release after refund", pc.methods.release().accountsPartial({ ...accts, escrow: escrowOf(id2), signer: client.publicKey }).rpc(), "AccountNotInitialized");

// 3. client reclaims after deadline
const id3 = new BN(3);
await fund(id3, 25, now() + 3);
await sleep(6000);
await pc.methods.refund().accountsPartial({ ...accts, escrow: escrowOf(id3), signer: client.publicKey }).rpc();
check("client reclaims after deadline", (await bal(client.publicKey)) === 900);

// 4. validation
await expectErr("zero amount rejected", fund(new BN(4), 0, now() + 3600), "ZeroAmount");
await expectErr("past deadline rejected", fund(new BN(5), 1, now() - 10), "DeadlineInPast");
await expectErr("long title rejected", fund(new BN(6), 1, now() + 3600, "x".repeat(65)), "TitleTooLong");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
