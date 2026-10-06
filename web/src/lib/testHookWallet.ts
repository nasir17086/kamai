import { BaseSignerWalletAdapter, WalletReadyState, type WalletName } from "@solana/wallet-adapter-base";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";

/**
 * Wallet for automated browser tests and demo recordings. It only exists when the test runner
 * injects `window.__kamaiTestWallet`; signing happens in the runner process, so no private key
 * ever enters the page.
 */
type Hook = { publicKey: () => Promise<string>; sign: (txBase64: string) => Promise<string> };

declare global {
  interface Window {
    __kamaiTestWallet?: Hook;
  }
}

export const TEST_WALLET_NAME = "Kamai Test Wallet" as WalletName<"Kamai Test Wallet">;

export class TestHookWalletAdapter extends BaseSignerWalletAdapter {
  name = TEST_WALLET_NAME;
  url = "https://github.com/nasir17086/kamai";
  icon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNyIgZmlsbD0iIzBmN2E0ZiIvPjx0ZXh0IHg9IjE2IiB5PSIyMyIgZm9udC1zaXplPSIxOCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SzwvdGV4dD48L3N2Zz4=";
  readyState = WalletReadyState.Installed;
  supportedTransactionVersions = new Set(["legacy", 0] as const);
  connecting = false;
  publicKey: PublicKey | null = null;

  async connect() {
    const hook = window.__kamaiTestWallet;
    if (!hook) throw new Error("Test wallet hook not present");
    this.connecting = true;
    this.publicKey = new PublicKey(await hook.publicKey());
    this.connecting = false;
    this.emit("connect", this.publicKey);
  }

  async disconnect() {
    this.publicKey = null;
    this.emit("disconnect");
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
    const hook = window.__kamaiTestWallet!;
    const isVersioned = tx instanceof VersionedTransaction;
    const raw = isVersioned ? tx.serialize() : (tx as Transaction).serialize({ requireAllSignatures: false, verifySignatures: false });
    const signed = Buffer.from(await hook.sign(Buffer.from(raw).toString("base64")), "base64");
    return (isVersioned ? VersionedTransaction.deserialize(signed) : Transaction.from(signed)) as T;
  }
}
