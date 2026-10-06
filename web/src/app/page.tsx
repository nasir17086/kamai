"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { QRCodeSVG } from "qrcode.react";
import { invoiceUrl, newInvoiceId, usdToPkr, whatsappShare } from "@/lib/kamai";
import { useT } from "@/lib/i18n";

export default function CreateInvoice() {
  const { publicKey } = useWallet();
  const { t } = useT();
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
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">{t.heroTag}</p>
        <h1 className="mt-2 text-4xl font-bold leading-tight">{t.heroTitle}</h1>
        <p className="mt-4 text-lg text-muted">
          {t.heroBody}
        </p>
        <ul className="mt-6 space-y-3 text-sm">
          {[
            [t.b1h, t.b1d],
            [t.b2h, t.b2d],
            [t.b3h, t.b3d],
            [t.b4h, t.b4d],
          ].map(([h, d]) => (
            <li key={h} className="flex gap-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand text-[11px] text-white">✓</span>
              <span><b>{h}.</b> <span className="text-muted">{d}</span></span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold">{t.createTitle}</h2>
        {!publicKey && (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            {t.connectFirst}
          </p>
        )}
        <label className="mt-4 block text-sm font-medium">{t.whatFor}</label>
        <input className="input mt-1" maxLength={64} placeholder={t.whatForPh} value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">{t.amount}</label>
            <input className="input mt-1" type="number" min="0" step="0.01" placeholder="120" value={amount} onChange={(e) => setAmount(e.target.value)} />
            {amt > 0 && <p className="mt-1 text-xs text-muted">≈ Rs {(amt * pkr).toLocaleString("en-PK", { maximumFractionDigits: 0 })}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">{t.dueDays}</label>
            <input className="input mt-1" type="number" min="1" value={dueDays} onChange={(e) => setDueDays(e.target.value)} />
            <p className="mt-1 text-xs text-muted">{t.reclaimHint}</p>
          </div>
        </div>
        <button className="btn mt-5 w-full" disabled={!valid} onClick={create}>{t.createBtn}</button>

        {link && (
          <div className="mt-5 border-t border-line pt-5">
            <p className="text-sm font-medium">{t.sendLink}</p>
            <div className="mt-2 flex gap-2">
              <input className="input font-mono text-xs" dir="ltr" readOnly value={link} onFocus={(e) => e.target.select()} />
              <button
                className="btn btn-ghost shrink-0"
                onClick={() => navigator.clipboard.writeText(link).then(() => setCopied(true))}
              >
                {copied ? t.copied : t.copy}
              </button>
            </div>
            <a
              className="btn mt-3 w-full"
              style={{ background: "#25D366" }}
              href={whatsappShare(`${t.waMsg(title.trim(), amt)} ${link}`)}
              target="_blank"
              rel="noreferrer"
            >
              {t.shareWa}
            </a>
            <div className="mt-4 flex justify-center rounded-lg bg-white p-4">
              <QRCodeSVG value={link} size={168} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
