"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useT } from "@/lib/i18n";

// The wallet button reads window state, so render it on the client only.
const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);

export default function Header() {
  const { t, toggle } = useT();
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">K</span>
          Kamai
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-800">Devnet</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-muted hover:text-ink">{t.navNew}</Link>
          <Link href="/dashboard/" className="text-muted hover:text-ink">{t.navDashboard}</Link>
          <Link href="/verify/" className="text-muted hover:text-ink">{t.navVerify}</Link>
          <button onClick={toggle} className="rounded-md border border-line px-2 py-1 text-xs font-semibold hover:bg-line">{t.langToggle}</button>
          <WalletMultiButton style={{ height: 38, fontSize: 14, background: "var(--brand)" }} />
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  const { t } = useT();
  return <footer className="border-t border-line py-6 text-center text-xs text-muted">{t.footer}</footer>;
}
