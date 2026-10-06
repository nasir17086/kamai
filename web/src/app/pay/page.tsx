"use client";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  USDC_MINT, ata, escrowPda, explorerTx, fromUnits, friendlyError, getProgram, parseInvoice, shortKey, toUnits, usdToPkr, STATUS, verifyUrl,
} from "@/lib/kamai";
import { useT } from "@/lib/i18n";

export default function PayPage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading invoice…</p>}>
      <Pay />
    </Suspense>
  );
}

function Pay() {
  const params = useSearchParams();
  const { t } = useT();
  const inv = parseInvoice(params);
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sig, setSig] = useState("");
  const [pkr, setPkr] = useState(280);

  const freelancer = inv ? new PublicKey(inv.to) : null;
  const escrow = inv && freelancer && wallet ? escrowPda(wallet.publicKey, freelancer, new BN(inv.id)) : null;

  useEffect(() => {
    usdToPkr().then(setPkr);
  }, []);

  useEffect(() => {
    if (!wallet || !escrow) return;
    connection.getTokenAccountBalance(ata(wallet.publicKey)).then(
      (b) => setBalance(b.value.uiAmount ?? 0),
      () => setBalance(0),
    );
    getProgram(connection, wallet).account.escrow.fetchNullable(escrow).then((e) => {
      setStatus(e ? STATUS[e.status] : null);
    });
  }, [wallet, escrow?.toBase58(), connection, sig]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!inv || !freelancer) {
    return <div className="card">{t.brokenLink}</div>;
  }

  const isSelf = wallet?.publicKey.equals(freelancer);
  const deadline = new Date(Date.now() + inv.dueDays * 86400_000);

  async function pay() {
    if (!wallet || !inv || !freelancer) return;
    setBusy(true);
    setError("");
    try {
      const program = getProgram(connection, wallet);
      const tx = await program.methods
        .fund(new BN(inv.id), toUnits(inv.amount), new BN(Math.floor(deadline.getTime() / 1000)), inv.title)
        .accounts({ client: wallet.publicKey, freelancer, mint: USDC_MINT, tokenProgram: TOKEN_PROGRAM_ID })
        .rpc();
      setSig(tx);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="card">
        <p className="text-sm text-muted">{t.invoiceFrom} <span dir="ltr">{shortKey(inv.to)}</span></p>
        <h1 className="mt-1 text-2xl font-bold">{inv.title || "Freelance work"}</h1>
        <p className="mt-4 text-4xl font-bold">{inv.amount.toLocaleString()} <span className="text-xl text-muted">USDC</span></p>
        <p className="text-sm text-muted">≈ Rs {(inv.amount * pkr).toLocaleString("en-PK", { maximumFractionDigits: 0 })} · {t.deliveryWithin(inv.dueDays)}</p>

        <div className="mt-5 rounded-lg bg-background p-4 text-sm">
          <b>{t.protects}</b> {t.protectsBody(deadline.toLocaleDateString())}
        </div>

        {!wallet && <p className="mt-5 text-sm">{t.connectToPay}</p>}
        {isSelf && <p className="mt-5 text-sm text-amber-700">{t.ownInvoice}</p>}

        {wallet && !isSelf && (
          <>
            <p className="mt-5 text-sm text-muted">
              {t.yourBalance} {balance === null ? "…" : balance.toLocaleString()}
              {balance !== null && balance < inv.amount && (
                <> · <a className="text-brand underline" href="https://faucet.circle.com" target="_blank" rel="noreferrer">{t.getTestUsdc}</a></>
              )}
            </p>
            {status ? (
              <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-900">
                {t.paidStatus} <b>{status}</b>. {t.manageOn} <Link className="underline" href="/dashboard/">{t.navDashboard}</Link>.
                {escrow && (
                  <a className="btn mt-3 w-full" href={verifyUrl(window.location.origin, escrow.toBase58())} target="_blank" rel="noreferrer">
                    {t.proofLink}
                  </a>
                )}
              </p>
            ) : (
              <button className="btn mt-4 w-full" disabled={busy || (balance ?? 0) < inv.amount} onClick={pay}>
                {busy ? t.confirmWallet : t.payBtn(inv.amount)}
              </button>
            )}
          </>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {sig && (
          <p className="mt-3 text-sm">
            {t.done} <a className="text-brand underline" href={explorerTx(sig)} target="_blank" rel="noreferrer">{t.viewExplorer}</a>
          </p>
        )}
        {escrow && (
          <p className="mt-4 text-xs text-muted">{t.vAccount}: <span className="font-mono" dir="ltr">{shortKey(escrow.toBase58())}</span> · {fromUnits(toUnits(inv.amount))} USDC</p>
        )}
      </div>
    </div>
  );
}
