// Demo housekeeping: the demo freelancer cancels every still-funded escrow (refunds the demo client).
import anchor from "@coral-xyz/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { readFileSync } from "node:fs";
const { AnchorProvider, Program, Wallet } = anchor;
const idl = JSON.parse(readFileSync(new URL("../src/idl/kamai.json", import.meta.url)));
const demo = JSON.parse(readFileSync(new URL("../../keys/demo.json", import.meta.url)));
const fl = Keypair.fromSecretKey(Uint8Array.from(demo.freelancer));
const conn = new Connection("https://api.devnet.solana.com", "confirmed");
const prog = new Program(idl, new AnchorProvider(conn, new Wallet(fl), { commitment: "confirmed" }));
const rows = await prog.account.escrow.all([{ memcmp: { offset: 40, bytes: fl.publicKey.toBase58() } }]);
for (const r of rows.filter((r) => r.account.status === 0)) {
  const a = r.account;
  await prog.methods.refund().accountsPartial({ signer: fl.publicKey, client: a.client, freelancer: a.freelancer, mint: a.mint, escrow: r.publicKey, tokenProgram: TOKEN_PROGRAM_ID }).rpc();
  console.log("cancelled", r.publicKey.toBase58());
}
