// Opens two visible Edge windows (Freelancer + Client) on the local build with the demo test wallets,
// so a person can click through create -> pay -> release by hand. Signing happens here in Node.
// Usage: serve out/ on :4321 (build with NEXT_PUBLIC_USDC_MINT=<keys/demo.json mint>), then
//        node scripts/try-local.mjs [clientUrl]
import { chromium } from "playwright";
import { Keypair, Transaction, VersionedTransaction } from "@solana/web3.js";
import { readFileSync } from "node:fs";

const APP = "http://localhost:4321";
const demo = JSON.parse(readFileSync(new URL("../../keys/demo.json", import.meta.url)));

function sign(kp, b64) {
  const raw = Buffer.from(b64, "base64");
  try {
    const tx = Transaction.from(raw);
    tx.partialSign(kp);
    return tx.serialize({ requireAllSignatures: false }).toString("base64");
  } catch {
    const vtx = VersionedTransaction.deserialize(raw);
    vtx.sign([kp]);
    return Buffer.from(vtx.serialize()).toString("base64");
  }
}

const browser = await chromium.launch({ channel: "msedge", headless: false });

async function open(role, x) {
  const kp = Keypair.fromSecretKey(Uint8Array.from(demo[role]));
  const ctx = await browser.newContext({ viewport: null });
  await ctx.exposeFunction("__kamaiPubkey", () => kp.publicKey.toBase58());
  await ctx.exposeFunction("__kamaiSign", (b64) => sign(kp, b64));
  await ctx.addInitScript((label) => {
    window.__kamaiTestWallet = { publicKey: () => window.__kamaiPubkey(), sign: (b) => window.__kamaiSign(b) };
    document.addEventListener("DOMContentLoaded", () => {
      document.title = label + " — " + document.title;
      const b = document.createElement("div");
      b.textContent = label + " window (test wallet)";
      b.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:99999;background:#0a5;color:#fff;font:600 14px Arial;padding:6px 10px;border-radius:8px";
      document.body.appendChild(b);
    });
  }, role === "freelancer" ? "FREELANCER" : "CLIENT");
  const page = await ctx.newPage();
  await page.goto(role === "freelancer" ? APP + "/dashboard/" : (process.argv[2] ?? APP + "/verify/"));
  console.log(role, kp.publicKey.toBase58(), "window open");
}

await open("freelancer");
await open("client");
console.log("Both windows open. Close them (or Ctrl+C) when done.");
browser.on("disconnected", () => process.exit(0));
