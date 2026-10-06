"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { QRCodeSVG } from "qrcode.react";
import { invoiceUrl, newInvoiceId, usdToPkr } from "@/lib/kamai";

export default function CreateInvoice() {
  const { publicKey } = useWallet();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDays, setDueDays] = useState("7");
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [pkr, setPkr] = useState(280);

  useEffect(() => {
    usdToPkr().then(setPkr);
  }, []);

  const amt = Number(amount);
  const valid = !!publicKey && title.trim().length > 0 && amt > 0 && Number(dueDays) > 0;

  function create() {
    if (!publicKey || !valid) return;
    setLink(
      invoiceUrl(window.location.origin, {
        to: publicKey.toBase58(),
        amount: amt,
        title: title.trim(),
        id: newInvoiceId(),
        dueDays: Number(dueDays),
      }),
    );
    setCopied(false);
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">For Pakistani freelancers</p>
        <h1 className="mt-2 text-4xl font-bold leading-tight">Get paid in seconds. Never get scammed out of your work.</h1>
        <p className="mt-4 text-lg text-muted">
          Send your client a Kamai invoice. They pay in USDC into an on-chain escrow, so you know the money is real
          before you start. When they approve, it lands in your wallet in under a second, for less than 1 rupee in fees.
        </p>
        <ul className="mt-6 space-y-3 text-sm">
          {[
            ["No 2–3% platform cut", "Payoneer and bank transfers take a cut and several days. Solana settles instantly."],
            ["Proof the client has paid", "Funds are locked in escrow before you start. Fake 'I placed the order' scams can't fake this."],
            ["Fair to clients too", "If you cancel, or the deadline passes, the client can take a full refund."],
          ].map(([h, d]) => (
            <li key={h} className="flex gap-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand text-[11px] text-white">✓</span>
              <span><b>{h}.</b> <span className="text-muted">{d}</span></span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold">Create an invoice</h2>
        {!publicKey && (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            Connect your wallet first (top right). Payments go to the wallet you connect.
          </p>
        )}
        <label className="mt-4 block text-sm font-medium">What is it for?</label>
        <input className="input mt-1" maxLength={64} placeholder="e.g. WordPress site, 5 pages" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Amount (USDC)</label>
            <input className="input mt-1" type="number" min="0" step="0.01" placeholder="120" value={amount} onChange={(e) => setAmount(e.target.value)} />
            {amt > 0 && <p className="mt-1 text-xs text-muted">≈ Rs {(amt * pkr).toLocaleString("en-PK", { maximumFractionDigits: 0 })}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Delivery in (days)</label>
            <input className="input mt-1" type="number" min="1" value={dueDays} onChange={(e) => setDueDays(e.target.value)} />
            <p className="mt-1 text-xs text-muted">Client can reclaim after this.</p>
          </div>
        </div>
        <button className="btn mt-5 w-full" disabled={!valid} onClick={create}>Create payment link</button>

        {link && (
          <div className="mt-5 border-t border-line pt-5">
            <p className="text-sm font-medium">Send this link to your client:</p>
            <div className="mt-2 flex gap-2">
              <input className="input font-mono text-xs" readOnly value={link} onFocus={(e) => e.target.select()} />
              <button
                className="btn btn-ghost shrink-0"
                onClick={() => navigator.clipboard.writeText(link).then(() => setCopied(true))}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="mt-4 flex justify-center rounded-lg bg-white p-4">
              <QRCodeSVG value={link} size={168} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
