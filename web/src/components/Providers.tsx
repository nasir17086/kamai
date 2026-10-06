"use client";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { RPC_URL } from "@/lib/kamai";
import { LangProvider } from "@/lib/i18n";
import "@solana/wallet-adapter-react-ui/styles.css";

// Wallets that implement the Wallet Standard (Phantom, Solflare, Backpack) are detected automatically.
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConnectionProvider endpoint={RPC_URL}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <LangProvider>{children}</LangProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
