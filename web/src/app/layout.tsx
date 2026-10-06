import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kamai — Get paid safely in USDC",
  description: "Escrow invoices for Pakistani freelancers on Solana. Your client pays into escrow; you get paid in seconds when they approve.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
          <footer className="border-t border-line py-6 text-center text-xs text-muted">
            Kamai runs on Solana devnet for the Crypto World&apos;s Fair hackathon. Test funds only.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
