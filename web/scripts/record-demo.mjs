// Records the technical demo video against devnet with two demo wallets (see setup-demo.mjs).
// Signing happens here in Node via an exposed function; no private key enters the page.
// Usage: node scripts/record-demo.mjs [appUrl]   (default http://localhost:4321)
import { chromium } from "playwright";
import { Keypair, Transaction, VersionedTransaction } from "@solana/web3.js";
import { readFileSync, mkdirSync } from "node:fs";

const APP = (process.argv[2] ?? "http://localhost:4321").replace(/\/$/, "");
const demo = JSON.parse(readFileSync(new URL("../../keys/demo.json", import.meta.url)));
const wallets = {
  freelancer: Keypair.fromSecretKey(Uint8Array.from(demo.freelancer)),
  client: Keypair.fromSecretKey(Uint8Array.from(demo.client)),
};
let role = "freelancer";

const outDir = new URL("../../video/raw/", import.meta.url);
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 760 }, recordVideo: { dir: outDir.pathname.slice(1), size: { width: 1280, height: 760 } } });

await ctx.exposeFunction("__kamaiPubkey", () => wallets[role].publicKey.toBase58());
await ctx.exposeFunction("__kamaiSign", (b64) => {
  const raw = Buffer.from(b64, "base64");
  const kp = wallets[role];
  try {
    const tx = Transaction.from(raw);
    tx.partialSign(kp);
    return tx.serialize({ requireAllSignatures: false }).toString("base64");
  } catch {
    const vtx = VersionedTransaction.deserialize(raw);
    vtx.sign([kp]);
    return Buffer.from(vtx.serialize()).toString("base64");
  }
});
await ctx.addInitScript(() => {
  window.__kamaiTestWallet = { publicKey: () => window.__kamaiPubkey(), sign: (b) => window.__kamaiSign(b) };
});

const page = await ctx.newPage();
const pause = (ms) => page.waitForTimeout(ms);

async function caption(text, ms = 2600) {
  await page.evaluate((t) => {
    let el = document.getElementById("__cap");
    if (!el) {
      el = document.createElement("div");
      el.id = "__cap";
      el.style.cssText = "position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:99999;max-width:900px;background:rgba(10,20,15,.88);color:#fff;font:600 22px/1.35 Arial,sans-serif;padding:14px 22px;border-radius:12px;text-align:center;box-shadow:0 6px 24px rgba(0,0,0,.3)";
      document.body.appendChild(el);
    }
    el.textContent = t;
    el.style.display = t ? "block" : "none";
  }, text);
  if (ms) await pause(ms);
}

async function connect() {
  await page.waitForLoadState("networkidle").catch(() => {});
  await pause(1500); // let autoConnect finish before deciding to click
  const modalItem = page.getByRole("button", { name: /Kamai Test Wallet/ });
  if (await page.getByRole("button", { name: /Select Wallet/ }).isVisible().catch(() => false)) {
    await page.getByRole("button", { name: /Select Wallet/ }).click();
    await modalItem.click();
  }
  await page.waitForFunction(() => !document.body.innerText.includes("Select Wallet"), null, { timeout: 15000 });
}

async function as(r, url) {
  role = r;
  await page.goto(url);
  await pause(800);
  await connect();
  await pause(900);
}

async function slowType(locator, text) {
  await locator.click();
  await locator.pressSequentially(text, { delay: 55 });
}

process.on("unhandledRejection", async (e) => { await page.screenshot({ path: "../video/fail.png" }).catch(() => {}); console.error(e); process.exit(1); });

// 0. Title
await page.goto(APP + "/");
await caption("Kamai: escrow payment links for Pakistani freelancers, on Solana (devnet demo)", 3800);

// 1. Freelancer creates an invoice
await caption("1. The freelancer connects a wallet and creates an invoice", 0);
await as("freelancer", APP + "/");
await slowType(page.getByPlaceholder(/WordPress/), "Shopify store, 3 milestones");
await page.locator('input[type="number"]').first().fill("");
await slowType(page.locator('input[type="number"]').first(), "200");
await pause(1200);
await caption("The PKR estimate updates live. Click: Create payment link", 2200);
await page.getByRole("button", { name: "Create payment link" }).click();
await pause(800);
await page.mouse.wheel(0, 400);
await caption("A payment link + QR code, ready to send on WhatsApp", 3600);
const payLink = await page.locator("input[readonly]").inputValue();

// 2. Client pays into escrow
await caption("2. The client opens the link and pays into escrow (not to the freelancer)", 0);
await as("client", payLink);
await page.mouse.wheel(0, -400);
await caption("The client sees exactly how the escrow protects them", 3200);
await page.getByRole("button", { name: /into escrow/ }).click();
await page.getByText(/Paid into escrow/).waitFor({ timeout: 60000 });
await caption("Paid. The 200 USDC is now locked in a Solana program-owned escrow", 3200);
const proofHref = await page.getByRole("link", { name: /proof of payment/ }).getAttribute("href");

// 3. Anyone can verify on-chain
await caption("3. No more fake 'payment sent' screenshots: anyone can verify on-chain", 0);
await page.goto(proofHref);
await page.getByText(/locked in escrow/).waitFor({ timeout: 30000 });
await pause(600);
await caption("Read straight from the blockchain: 200 USDC locked for this job", 3800);

// 4. Milestone release
await caption("4. Milestone 1 delivered: the client releases 60 USDC", 0);
await as("client", APP + "/dashboard/");
await page.getByPlaceholder("Milestone").first().waitFor({ timeout: 30000 }).catch(async (e) => { await page.screenshot({ path: "../video/fail.png" }); console.log("TEXT:", (await page.innerText("main")).slice(0, 800)); throw e; });
await pause(800);
await slowType(page.getByPlaceholder("Milestone").first(), "60");
await page.getByRole("button", { name: "Release part" }).first().click();
await page.getByText(/Payment released/).waitFor({ timeout: 60000 });
await caption("60 USDC reached the freelancer in under a second, for a fraction of a cent", 3400);

await page.goto(proofHref);
await page.getByText(/locked in escrow/).waitFor({ timeout: 30000 });
await caption("The proof page now shows 60 paid and 140 still safely locked", 3600);
await page.getByRole("button", { name: "اردو" }).click();
await caption("The whole app also works in Urdu (right-to-left)", 3600);
await page.getByRole("button", { name: "English" }).click();

// 5. Freelancer sees the money
await caption("5. The freelancer's dashboard: paid out vs. still locked in escrow", 0);
await as("freelancer", APP + "/dashboard/");
await page.getByText(/Paid out to you/).waitFor({ timeout: 30000 });
await pause(2500);
await caption("", 0);
await pause(1500);

// 6. Final payment
await caption("6. Work finished: the client pays the rest", 0);
await as("client", APP + "/dashboard/");
await page.getByRole("button", { name: "Pay the rest" }).first().waitFor({ timeout: 30000 });
await pause(800);
await page.getByRole("button", { name: "Pay the rest" }).first().click();
await page.getByText(/Payment released/).waitFor({ timeout: 60000 });
await pause(1500);
await caption("Invoice complete. If the freelancer cancels or the deadline passes, the client gets back whatever is unreleased", 4500);
await caption("Kamai: get paid in seconds. Never get scammed out of your work. github.com/nasir17086/kamai", 4500);

const video = page.video();
await ctx.close();
await browser.close();
console.log("VIDEO", await video.path());
