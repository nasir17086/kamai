"use client";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { useCallback, useEffect, useState } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import type { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { STATUS, explorerTx, fromUnits, friendlyError, getProgram, shortKey, toUnits, usdToPkr, verifyUrl } from "@/lib/kamai";

type Row = {
  pubkey: PublicKey;
  account: {
    client: PublicKey; freelancer: PublicKey; mint: PublicKey; invoiceId: BN; amount: BN; released: BN;
    deadline: BN; createdAt: BN; status: number; title: string;
  };
};

// Byte offsets inside the account (after the 8-byte discriminator) used to filter on-chain.
const CLIENT_OFFSET = 8;
const FREELANCER_OFFSET = 8 + 32;

export default function Dashboard() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [rows, setRows] = useState<{ role: "client" | "freelancer"; r: Row }[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyKey, setBusyKey] = useState("");
  const [msg, setMsg] = useState<{ text: string; sig?: string } | null>(null);
  const [pkr, setPkr] = useState(280);
  const [part, setPart] = useState<Record<string, string>>({});

  useEffect(() => {
    usdToPkr().then(setPkr);
  }, []);

  const load = useCallback(async () => {
    if (!wallet) return;
    setLoading(true);
    const program = getProgram(connection, wallet);
    const me = wallet.publicKey.toBase58();
    const [asClient, asFreelancer] = await Promise.all([
      program.account.escrow.all([{ memcmp: { offset: CLIENT_OFFSET, bytes: me } }]),
      program.account.escrow.all([{ memcmp: { offset: FREELANCER_OFFSET, bytes: me } }]),
    ]);
    const all = [
      ...asFreelancer.map((r) => ({ role: "freelancer" as const, r: r as unknown as Row })),
      ...asClient.map((r) => ({ role: "client" as const, r: r as unknown as Row })),
    ].sort((a, b) => b.r.account.createdAt.toNumber() - a.r.account.createdAt.toNumber());
    setRows(all);
    setLoading(false);
  }, [wallet, connection]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(kind: "release" | "refund", r: Row, amount?: BN) {
    if (!wallet) return;
    setBusyKey(r.pubkey.toBase58() + kind);
    setMsg(null);
    try {
      const program = getProgram(connection, wallet);
      const accounts = {
        signer: wallet.publicKey,
        client: r.account.client,
        freelancer: r.account.freelancer,
        mint: r.account.mint,
        escrow: r.pubkey,
        tokenProgram: TOKEN_PROGRAM_ID,
      };
      const sig = kind === "release"
        ? await program.methods.release(amount ?? r.account.amount.sub(r.account.released)).accountsPartial(accounts).rpc()
        : await program.methods.refund().accountsPartial(accounts).rpc();
      setMsg({ text: kind === "release" ? "Payment released to the freelancer." : "Remaining escrow refunded to the client.", sig });
      setPart((p) => ({ ...p, [r.pubkey.toBase58()]: "" }));
      await load();
    } catch (e) {
      setMsg({ text: friendlyError(e) });
    } finally {
      setBusyKey("");
    }
  }

  if (!wallet) return <div className="card">Connect your wallet to see your invoices and payments.</div>;

  const now = Date.now() / 1000;
  const remaining = (a: Row["account"]) => fromUnits(a.amount.sub(a.released));
  const earnedLocked = rows
    .filter((x) => x.role === "freelancer" && x.r.account.status === 0)
    .reduce((s, x) => s + remaining(x.r.account), 0);
  const earnedPaid = rows
    .filter((x) => x.role === "freelancer")
    .reduce((s, x) => s + fromUnits(x.r.account.released), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Locked in escrow for you" usd={earnedLocked} pkr={pkr} />
        <Stat label="Paid out to you" usd={earnedPaid} pkr={pkr} />
        <div className="card">
          <p className="text-sm text-muted">Invoices</p>
          <p className="mt-1 text-2xl font-bold">{rows.length}</p>
          <button className="mt-1 text-sm text-brand underline" onClick={load}>{loading ? "Refreshing…" : "Refresh"}</button>
        </div>
      </div>

      {msg && (
        <p className="mt-4 rounded-lg bg-background p-3 text-sm">
          {msg.text}{" "}
          {msg.sig && <a className="text-brand underline" href={explorerTx(msg.sig)} target="_blank" rel="noreferrer">View transaction</a>}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {!loading && rows.length === 0 && (
          <div className="card text-sm text-muted">No escrows yet. Create an invoice and send the link to a client.</div>
        )}
        {rows.map(({ role, r }) => {
          const a = r.account;
          const funded = a.status === 0;
          const pastDeadline = now > a.deadline.toNumber();
          const k = r.pubkey.toBase58();
          return (
            <div key={k + role} className="card flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold">{a.title || "Freelance work"}</p>
                <p className="text-sm text-muted">
                  {role === "freelancer" ? `From client ${shortKey(a.client.toBase58())}` : `To freelancer ${shortKey(a.freelancer.toBase58())}`}
                  {" · "}due {new Date(a.deadline.toNumber() * 1000).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-bold">{fromUnits(a.amount).toLocaleString()} USDC</p>
                  {a.released.gtn(0) && a.status !== 1 && (
                    <p className="text-xs text-muted">{fromUnits(a.released).toLocaleString()} paid · {remaining(a).toLocaleString()} left</p>
                  )}
                  <StatusPill status={a.status} />
                </div>
                {funded && role === "client" && (
                  <div className="flex items-center gap-2">
                    <input
                      className="input w-24 py-2 text-sm"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Milestone"
                      title="Release part of the payment for a finished milestone"
                      value={part[k] ?? ""}
                      onChange={(e) => setPart((p) => ({ ...p, [k]: e.target.value }))}
                    />
                    <button
                      className="btn btn-ghost"
                      disabled={!!busyKey || !(Number(part[k]) > 0 && Number(part[k]) < remaining(a))}
                      onClick={() => act("release", r, toUnits(Number(part[k])))}
                    >
                      Release part
                    </button>
                    <button className="btn" disabled={!!busyKey} onClick={() => act("release", r)}>
                      {busyKey === k + "release" ? "…" : a.released.gtn(0) ? "Pay the rest" : "Approve & pay all"}
                    </button>
                  </div>
                )}
                {funded && role === "client" && pastDeadline && (
                  <button className="btn btn-ghost" disabled={!!busyKey} onClick={() => act("refund", r)}>Reclaim</button>
                )}
                <a className="text-xs text-brand underline" href={verifyUrl(window.location.origin, k)} target="_blank" rel="noreferrer">
                  Proof
                </a>
                {funded && role === "freelancer" && (
                  <button className="btn btn-ghost" disabled={!!busyKey} onClick={() => act("refund", r)}>
                    {busyKey === k + "refund" ? "…" : "Cancel & refund"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, usd, pkr }: { label: string; usd: number; pkr: number }) {
  return (
    <div className="card">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold">{usd.toLocaleString()} USDC</p>
      <p className="text-xs text-muted">≈ Rs {(usd * pkr).toLocaleString("en-PK", { maximumFractionDigits: 0 })}</p>
    </div>
  );
}

function StatusPill({ status }: { status: number }) {
  const cls = ["bg-amber-100 text-amber-800", "bg-green-100 text-green-800", "bg-slate-200 text-slate-700"][status];
  return <span className={`rounded px-2 py-0.5 text-xs font-semibold ${cls}`}>{STATUS[status] === "Funded" ? "In escrow" : STATUS[status]}</span>;
}
