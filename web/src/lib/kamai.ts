import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import idl from "@/idl/kamai.json";
import type { Kamai } from "@/idl/kamai";

export const CLUSTER = "devnet" as const;
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL ?? clusterApiUrl(CLUSTER);
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const PROGRAM_ID = new PublicKey(idl.address);
// Circle's devnet USDC. Free test USDC: https://faucet.circle.com (pick Solana Devnet).
// NEXT_PUBLIC_USDC_MINT overrides it for local demo recordings that use a private test stablecoin.
export const USDC_MINT = new PublicKey(process.env.NEXT_PUBLIC_USDC_MINT || "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
export const USDC_DECIMALS = 6;

export const STATUS = ["Funded", "Released", "Refunded"] as const;

export function getProgram(connection: Connection, wallet: AnchorWallet) {
  const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
  return new Program<Kamai>(idl as Kamai, provider);
}

/** Read-only program for pages that show escrow data without a connected wallet (e.g. /verify). */
export function getReadProgram(connection: Connection) {
  const wallet = {
    publicKey: PublicKey.default,
    signTransaction: async <T,>(t: T) => t,
    signAllTransactions: async <T,>(t: T[]) => t,
  } as AnchorWallet;
  return getProgram(connection, wallet);
}

export function escrowPda(client: PublicKey, freelancer: PublicKey, invoiceId: BN) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), client.toBuffer(), freelancer.toBuffer(), invoiceId.toArrayLike(Buffer, "le", 8)],
    PROGRAM_ID,
  )[0];
}

export function ata(owner: PublicKey, allowOffCurve = false) {
  return getAssociatedTokenAddressSync(USDC_MINT, owner, allowOffCurve, TOKEN_PROGRAM_ID);
}

export const toUnits = (usdc: number) => new BN(Math.round(usdc * 10 ** USDC_DECIMALS));
export const fromUnits = (units: BN | number) => Number(units.toString()) / 10 ** USDC_DECIMALS;

/** An invoice is just a link: everything the client needs is in the query string. */
export type Invoice = { to: string; amount: number; title: string; id: string; dueDays: number };

export function invoiceUrl(origin: string, inv: Invoice) {
  const q = new URLSearchParams({
    to: inv.to,
    amt: String(inv.amount),
    t: inv.title,
    id: inv.id,
    due: String(inv.dueDays),
  });
  return `${origin}${BASE_PATH}/pay/?${q.toString()}`;
}

export function parseInvoice(p: URLSearchParams): Invoice | null {
  try {
    const to = new PublicKey(p.get("to") ?? "").toBase58();
    const amount = Number(p.get("amt"));
    const id = p.get("id") ?? "";
    const dueDays = Number(p.get("due") ?? "7");
    if (!(amount > 0) || !/^\d+$/.test(id) || !(dueDays > 0)) return null;
    return { to, amount, title: (p.get("t") ?? "").slice(0, 64), id, dueDays };
  } catch {
    return null;
  }
}

export const newInvoiceId = () => String(Date.now()) + String(Math.floor(Math.random() * 1000)).padStart(3, "0");

export const shortKey = (k: string) => `${k.slice(0, 4)}…${k.slice(-4)}`;

export const explorerAddr = (addr: string) => `https://explorer.solana.com/address/${addr}?cluster=${CLUSTER}`;

/** Public proof-of-payment page for an escrow account. Anyone can open it; no wallet needed. */
export const verifyUrl = (origin: string, escrow: string) => `${origin}${BASE_PATH}/verify/?e=${escrow}`;

export const whatsappShare = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;

export const explorerTx = (sig: string) => `https://explorer.solana.com/tx/${sig}?cluster=${CLUSTER}`;

/** USD→PKR for display only. Falls back to a fixed rate if the API is unreachable. */
export async function usdToPkr(): Promise<number> {
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/USD");
    const j = await r.json();
    return j?.rates?.PKR ?? 280;
  } catch {
    return 280;
  }
}

export function friendlyError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/User rejected/i.test(msg)) return "You cancelled the transaction in your wallet.";
  if (/insufficient (funds|lamports)/i.test(msg) || /0x1\b/.test(msg)) return "Not enough USDC or SOL in your wallet for this payment.";
  if (/AccountNotInitialized|could not find account/i.test(msg)) return "Your wallet has no USDC account yet. Get test USDC from faucet.circle.com first.";
  if (/already in use/i.test(msg)) return "This invoice has already been paid.";
  return msg.length > 200 ? msg.slice(0, 200) + "…" : msg;
}
