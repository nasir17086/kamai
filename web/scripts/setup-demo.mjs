// Local-only demo setup for recording videos on devnet. Writes ../keys/demo.json (gitignored).
// Creates a test stablecoin (authority = FUNDER, kept private) and two funded demo wallets.
// Usage: FUNDER=../keys/id.json node scripts/setup-demo.mjs
import { Connection, Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { readFileSync, writeFileSync } from "node:fs";

const conn = new Connection("https://api.devnet.solana.com", "confirmed");
const funder = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(process.env.FUNDER, "utf8"))));
const freelancer = Keypair.generate(), client = Keypair.generate();
await sendAndConfirmTransaction(conn, new Transaction().add(
  SystemProgram.transfer({ fromPubkey: funder.publicKey, toPubkey: freelancer.publicKey, lamports: 0.1 * LAMPORTS_PER_SOL }),
  SystemProgram.transfer({ fromPubkey: funder.publicKey, toPubkey: client.publicKey, lamports: 0.1 * LAMPORTS_PER_SOL })), [funder]);
const mint = await createMint(conn, funder, funder.publicKey, null, 6);
const ata = await getOrCreateAssociatedTokenAccount(conn, funder, mint, client.publicKey);
await mintTo(conn, funder, mint, ata.address, funder, 1000_000000n);
writeFileSync(new URL("../../keys/demo.json", import.meta.url), JSON.stringify({
  mint: mint.toBase58(),
  freelancer: Array.from(freelancer.secretKey),
  client: Array.from(client.secretKey),
}));
console.log("mint", mint.toBase58(), "freelancer", freelancer.publicKey.toBase58(), "client", client.publicKey.toBase58());
