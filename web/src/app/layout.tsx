import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import Header, { Footer } from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE = "https://nasir17086.github.io/kamai/";
const DESCRIPTION =
  "USDC escrow payment links for Pakistani freelancers on Solana: milestones, on-chain proof of payment, Urdu & WhatsApp.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Kamai — Get paid safely in USDC",
  description: DESCRIPTION,
  openGraph: {
    title: "Kamai — Get paid in seconds. Never get scammed out of your work.",
    description: DESCRIPTION,
    url: SITE,
    siteName: "Kamai",
    images: [{ url: SITE + "og.png", width: 1200, height: 630, alt: "Kamai — USDC escrow payment links on Solana" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kamai — Get paid in seconds. Never get scammed out of your work.",
    description: DESCRIPTION,
    images: [SITE + "og.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
