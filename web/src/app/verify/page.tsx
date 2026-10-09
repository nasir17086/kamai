"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import type { BN } from "@coral-xyz/anchor";
import { explorerAddr, fromUnits, getReadProgram, shortKey, usdToPkr } from "@/lib/kamai";
import { useT } from "@/lib/i18n";

type Escrow = {
  client: PublicKey; freelancer: PublicKey; amount: BN; released: BN; deadline: BN; status: number; title: string;
};

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <Verify />
    </Suspense>
  );
}

/** Accepts a bare escrow address or any URL carrying it in `?e=`. */
function parseEscrow(input: string): PublicKey | null {
  const raw = input.trim();
  let candidate = raw;
  try {
    candidate = new URL(raw).searchParams.get("e") ?? "";
  } catch {}
  try {
    return new PublicKey(candidate);
  } catch {
    return null;
  }
}

function Verify() {
  const params = useSearchParams();
  const router = useRouter();
  const { connection } = useConnection();
  const { t } = useT();
  const [input, setInput] = useState(params.get("e") ?? "");
  const [state, setState] = useState<"idle" | "loading" | "bad" | "missing" | "found">("idle");
  const [escrow, setEscrow] = useState<{ key: PublicKey; data: Escrow } | null>(null);
  const [pkr, setPkr] = useState(280);

  useEffect(() => {
    usdToPkr().then(setPkr);
  }, []);

  const check = useCallback(
    async (value: string) => {
      const key = parseEscrow(value);
      if (!key) return setState("bad");
      setState("loading");
      try {
        const data = (await getReadProgram(connection).account.escrow.fetchNullable(key)) as Escrow | null;
        if (!data) return setState("missing");
        setEscrow({ key, data });
        setState("found");
      } catch {
        setState("missing");
      }
    },
    [connection],
  );

  useEffect(() => {
    const e = params.get("e");
    if (e) check(e);
  }, [params, check]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // A Kamai pay link (/pay/?to=…) has no escrow yet; open it instead of rejecting it.
    try {
      const url = new URL(input.trim());
      if (url.pathname.includes("/pay") && url.searchParams.get("to")) return router.push(`/pay/${url.search}`);
    } catch {}
    const key = parseEscrow(input);
    if (key) router.replace(`/verify/?e=${key.toBase58()}`);
    check(input);
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold">{t.verifyTitle}</h1>
      <p className="mt-2 text-muted">{t.verifyBody}</p>
      <form onSubmit={submit} className="mt-5 flex gap-2">
        <input className="input font-mono text-sm" dir="ltr" placeholder={t.verifyPh} value={input} onChange={(e) => setInput(e.target.value)} />
        <button className="btn shrink-0" disabled={!input.trim()}>{t.verifyBtn}</button>
      </form>

      <div className="mt-6">
        {state === "loading" && <p className="text-muted">{t.checking}</p>}
        {state === "bad" && <p className="card text-red-600">{t.badAddr}</p>}
        {state === "missing" && <p className="card border-red-300 bg-red-50 font-semibold text-red-800">✗ {t.notFound}</p>}
        {state === "found" && escrow && <Result t={t} pkr={pkr} k={escrow.key} e={escrow.data} />}
      </div>
    </div>
  );
}

function Result({ t, pkr, k, e }: { t: ReturnType<typeof useT>["t"]; pkr: number; k: PublicKey; e: Escrow }) {
  const total = fromUnits(e.amount);
  const released = fromUnits(e.released);
  const locked = e.status === 0 ? total - released : 0;
  const banner = [
    { cls: "border-green-300 bg-green-50 text-green-900", icon: "🔒", head: t.vLocked, sub: t.vLockedSub },
    { cls: "border-green-300 bg-green-50 text-green-900", icon: "✓", head: t.vReleased, sub: "" },
    { cls: "border-line bg-background", icon: "↩", head: t.vRefunded, sub: "" },
  ][e.status];
  const rs = (usd: number) => `≈ Rs ${(usd * pkr).toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;

  return (
    <div className="card">
      <div className={`rounded-lg border p-4 ${banner.cls}`}>
        <p className="text-lg font-bold">{banner.icon} {banner.head}</p>
        {banner.sub && <p className="mt-1 text-sm">{banner.sub}</p>}
      </div>
      <h2 className="mt-5 text-xl font-semibold">{e.title || "Freelance work"}</h2>
      {e.amount.gt(e.released) && released > 0 && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
          <div className="h-full bg-brand" style={{ width: `${(released / total) * 100}%` }} />
        </div>
      )}
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <Row label={t.vTotal} value={`${total.toLocaleString()} USDC`} sub={rs(total)} />
        <Row label={t.vReleasedAmt} value={`${released.toLocaleString()} USDC`} />
        <Row label={t.vInEscrow} value={`${locked.toLocaleString()} USDC`} sub={locked ? rs(locked) : undefined} />
        <Row label={t.vDeadline} value={new Date(e.deadline.toNumber() * 1000).toLocaleDateString()} />
        <Row label={t.vClient} value={shortKey(e.client.toBase58())} mono />
        <Row label={t.vFreelancer} value={shortKey(e.freelancer.toBase58())} mono />
      </dl>
      <p className="mt-5 text-xs text-muted">
        {t.vAccount}: <span className="font-mono" dir="ltr">{k.toBase58()}</span>
        <br />
        <a className="text-brand underline" href={explorerAddr(k.toBase58())} target="_blank" rel="noreferrer">{t.vOnExplorer}</a>
      </p>
    </div>
  );
}

function Row({ label, value, sub, mono }: { label: string; value: string; sub?: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className={`font-semibold ${mono ? "font-mono" : ""}`}><span dir="ltr">{value}</span></dd>
      {sub && <dd className="text-xs text-muted"><span dir="ltr">{sub}</span></dd>}
    </div>
  );
}
