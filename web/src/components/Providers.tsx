"use client";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { RPC_URL } from "@/lib/kamai";
import { LangProvider } from "@/lib/i18n";
import { TestHookWalletAdapter } from "@/lib/testHookWallet";
import { useMemo } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";

// Wallets that implement the Wallet Standard (Phantom, Solflare, Backpack) are detected automatically.
export default function Providers({ children }: { children: React.ReactNode }) {
  // Only present when an automated test/recording runner injects its signing hook.
  const wallets = useMemo(() => (typeof window !== "undefined" && window.__kamaiTestWallet ? [new TestHookWalletAdapter()] : []), []);
  return (
    <ConnectionProvider endpoint={RPC_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <LangProvider>{children}</LangProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
