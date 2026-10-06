"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

// The wallet button reads window state, so render it on the client only.
const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);

export default function Header() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">K</span>
          Kamai
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-800">Devnet</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-muted hover:text-ink">New invoice</Link>
          <Link href="/dashboard/" className="text-muted hover:text-ink">Dashboard</Link>
          <WalletMultiButton style={{ height: 38, fontSize: 14, background: "var(--brand)" }} />
        </nav>
      </div>
    </header>
  );
}
