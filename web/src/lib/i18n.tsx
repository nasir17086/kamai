"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "ur";

const en = {
  navNew: "New invoice",
  navDashboard: "Dashboard",
  navVerify: "Verify payment",
  langToggle: "اردو",
  footer: "Kamai runs on Solana devnet for the Crypto World's Fair hackathon. Test funds only.",

  heroTag: "For Pakistani freelancers",
  heroTitle: "Get paid in seconds. Never get scammed out of your work.",
  heroBody:
    "Send your client a Kamai invoice. They pay in USDC into an on-chain escrow, so you know the money is real before you start. When they approve, it lands in your wallet in under a second, for less than 1 rupee in fees.",
  b1h: "No 2–3% platform cut",
  b1d: "Payoneer and bank transfers take a cut and several days. Solana settles instantly.",
  b2h: "Proof the client has paid",
  b2d: "Funds are locked in escrow before you start, and anyone can verify it on-chain. A fake screenshot can't fake this.",
  b3h: "Milestone payments",
  b3d: "The client can release part of the money as each stage is delivered.",
  b4h: "Fair to clients too",
  b4d: "If you cancel, or the deadline passes, the client gets back whatever has not been released.",
  watchDemo: "▶ Watch the 80-second demo",
  seeProof: "🔒 See a live on-chain proof",
  createTitle: "Create an invoice",
  connectFirst: "Connect your wallet first (top right). Payments go to the wallet you connect.",
  whatFor: "What is it for?",
  whatForPh: "e.g. WordPress site, 5 pages",
  amount: "Amount (USDC)",
  dueDays: "Delivery in (days)",
  reclaimHint: "Client can reclaim after this.",
  createBtn: "Create payment link",
  sendLink: "Send this link to your client:",
  copy: "Copy",
  copied: "Copied",
  shareWa: "Share on WhatsApp",
  waMsg: (title: string, amt: number) => `Invoice for "${title}" — ${amt} USDC. Pay safely into escrow here:`,

  invoiceFrom: "Invoice from",
  deliveryWithin: (d: number) => `delivery within ${d} days`,
  protects: "How this protects you:",
  protectsBody: (date: string) =>
    `your USDC goes into an escrow controlled by a Solana program, not to the freelancer. You release it when you are happy with the work, all at once or in milestones. If the work is not delivered by ${date}, you can take back whatever has not been released.`,
  connectToPay: "Connect your wallet (top right) to pay.",
  ownInvoice: "This is your own invoice. Share the link with your client.",
  yourBalance: "Your USDC balance:",
  getTestUsdc: "get test USDC",
  paidStatus: "Paid into escrow · status:",
  manageOn: "Manage it on your",
  payBtn: (a: number) => `Pay ${a} USDC into escrow`,
  confirmWallet: "Confirm in your wallet…",
  done: "Done.",
  viewExplorer: "View on Solana Explorer",
  proofLink: "Share proof of payment",
  brokenLink: "This payment link is broken or incomplete. Ask the freelancer to send it again.",

  verifyTitle: "Verify a payment",
  verifyBody:
    "Got a \"payment sent\" screenshot? Don't trust it. Paste the proof link or escrow address here. Kamai reads it straight from the Solana blockchain.",
  verifyPh: "Proof link or escrow address",
  verifyBtn: "Check on-chain",
  notFound: "No Kamai escrow exists at this address. The payment has NOT been made.",
  badAddr: "That is not a valid link or address.",
  checking: "Reading from Solana…",
  vLocked: "Money is locked in escrow",
  vLockedSub: "The client has really paid. The freelancer can start work safely.",
  vReleased: "Paid out to the freelancer",
  vRefunded: "Refunded to the client",
  vTotal: "Invoice total",
  vReleasedAmt: "Released to freelancer",
  vInEscrow: "Still in escrow",
  vClient: "Client",
  vFreelancer: "Freelancer",
  vDeadline: "Deadline",
  vAccount: "Escrow account",
  vOnExplorer: "See it on Solana Explorer",
};

type Dict = typeof en;

const ur: Dict = {
  navNew: "نیا انوائس",
  navDashboard: "ڈیش بورڈ",
  navVerify: "ادائیگی کی تصدیق",
  langToggle: "English",
  footer: "کمائی کرپٹو ورلڈز فیئر ہیکاتھون کے لیے سولانا ڈیوِنیٹ پر چل رہا ہے۔ صرف ٹیسٹ رقم۔",

  heroTag: "پاکستانی فری لانسرز کے لیے",
  heroTitle: "سیکنڈوں میں ادائیگی۔ آپ کی محنت کبھی ضائع نہ ہو۔",
  heroBody:
    "اپنے کلائنٹ کو کمائی انوائس بھیجیں۔ وہ USDC میں آن چین ایسکرو میں ادائیگی کرتا ہے، اس لیے کام شروع کرنے سے پہلے آپ کو یقین ہوتا ہے کہ پیسہ اصلی ہے۔ منظوری پر رقم ایک سیکنڈ سے کم میں آپ کے والٹ میں، ایک روپے سے بھی کم فیس پر۔",
  b1h: "۲–۳٪ کٹوتی نہیں",
  b1d: "پیونیئر اور بینک کٹوتی بھی کرتے ہیں اور کئی دن بھی لگاتے ہیں۔ سولانا فوراً ادائیگی کرتا ہے۔",
  b2h: "کلائنٹ کی ادائیگی کا ثبوت",
  b2d: "کام شروع ہونے سے پہلے رقم ایسکرو میں بند ہوتی ہے، اور کوئی بھی آن چین تصدیق کر سکتا ہے۔ جعلی اسکرین شاٹ اسے جھٹلا نہیں سکتا۔",
  b3h: "مرحلہ وار ادائیگی",
  b3d: "ہر مرحلہ مکمل ہونے پر کلائنٹ رقم کا کچھ حصہ جاری کر سکتا ہے۔",
  b4h: "کلائنٹ کے ساتھ بھی انصاف",
  b4d: "اگر آپ کام منسوخ کریں یا ڈیڈ لائن گزر جائے تو جو رقم جاری نہیں ہوئی وہ کلائنٹ کو واپس مل جاتی ہے۔",
  watchDemo: "▶ ۸۰ سیکنڈ کا ڈیمو دیکھیں",
  seeProof: "🔒 آن چین ثبوت دیکھیں",
  createTitle: "انوائس بنائیں",
  connectFirst: "پہلے اپنا والٹ جوڑیں (اوپر دائیں)۔ ادائیگی اسی والٹ میں آئے گی۔",
  whatFor: "کام کیا ہے؟",
  whatForPh: "مثلاً ورڈپریس ویب سائٹ، ۵ صفحات",
  amount: "رقم (USDC)",
  dueDays: "ڈیلیوری (دن)",
  reclaimHint: "اس کے بعد کلائنٹ رقم واپس لے سکتا ہے۔",
  createBtn: "ادائیگی کا لنک بنائیں",
  sendLink: "یہ لنک اپنے کلائنٹ کو بھیجیں:",
  copy: "کاپی",
  copied: "کاپی ہو گیا",
  shareWa: "واٹس ایپ پر بھیجیں",
  waMsg: (title: string, amt: number) => `انوائس: "${title}" — ${amt} USDC۔ یہاں محفوظ ایسکرو میں ادائیگی کریں:`,

  invoiceFrom: "انوائس از",
  deliveryWithin: (d: number) => `${d} دن میں ڈیلیوری`,
  protects: "یہ آپ کو کیسے محفوظ رکھتا ہے:",
  protectsBody: (date: string) =>
    `آپ کی USDC فری لانسر کو نہیں بلکہ سولانا پروگرام کے کنٹرول والے ایسکرو میں جاتی ہے۔ کام سے مطمئن ہونے پر آپ رقم جاری کرتے ہیں، ایک ساتھ یا مرحلہ وار۔ اگر ${date} تک کام نہ ملے تو جاری نہ ہونے والی رقم آپ واپس لے سکتے ہیں۔`,
  connectToPay: "ادائیگی کے لیے اپنا والٹ جوڑیں (اوپر دائیں)۔",
  ownInvoice: "یہ آپ کا اپنا انوائس ہے۔ یہ لنک اپنے کلائنٹ کو بھیجیں۔",
  yourBalance: "آپ کا USDC بیلنس:",
  getTestUsdc: "ٹیسٹ USDC حاصل کریں",
  paidStatus: "ایسکرو میں ادائیگی ہو گئی · حالت:",
  manageOn: "اسے سنبھالیں:",
  payBtn: (a: number) => `${a} USDC ایسکرو میں ادا کریں`,
  confirmWallet: "اپنے والٹ میں تصدیق کریں…",
  done: "ہو گیا۔",
  viewExplorer: "سولانا ایکسپلورر پر دیکھیں",
  proofLink: "ادائیگی کا ثبوت بھیجیں",
  brokenLink: "یہ ادائیگی کا لنک نامکمل ہے۔ فری لانسر سے دوبارہ بھیجنے کو کہیں۔",

  verifyTitle: "ادائیگی کی تصدیق کریں",
  verifyBody:
    "\"پیسے بھیج دیے\" والا اسکرین شاٹ ملا ہے؟ اس پر بھروسہ نہ کریں۔ ثبوت کا لنک یا ایسکرو ایڈریس یہاں لگائیں۔ کمائی اسے براہِ راست سولانا بلاک چین سے پڑھتا ہے۔",
  verifyPh: "ثبوت کا لنک یا ایسکرو ایڈریس",
  verifyBtn: "آن چین چیک کریں",
  notFound: "اس ایڈریس پر کوئی کمائی ایسکرو نہیں ہے۔ ادائیگی نہیں ہوئی۔",
  badAddr: "یہ درست لنک یا ایڈریس نہیں ہے۔",
  checking: "سولانا سے پڑھا جا رہا ہے…",
  vLocked: "رقم ایسکرو میں بند ہے",
  vLockedSub: "کلائنٹ نے واقعی ادائیگی کی ہے۔ فری لانسر بلا خوف کام شروع کر سکتا ہے۔",
  vReleased: "فری لانسر کو ادائیگی ہو گئی",
  vRefunded: "کلائنٹ کو رقم واپس ہو گئی",
  vTotal: "کل رقم",
  vReleasedAmt: "فری لانسر کو جاری",
  vInEscrow: "ایسکرو میں باقی",
  vClient: "کلائنٹ",
  vFreelancer: "فری لانسر",
  vDeadline: "ڈیڈ لائن",
  vAccount: "ایسکرو اکاؤنٹ",
  vOnExplorer: "سولانا ایکسپلورر پر دیکھیں",
};

const dicts = { en, ur };
const Ctx = createContext<{ lang: Lang; t: Dict; toggle: () => void }>({ lang: "en", t: en, toggle: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    try {
      // ?lang=ur in a shared link wins over the saved preference.
      const fromUrl = new URLSearchParams(window.location.search).get("lang");
      if (fromUrl === "ur" || fromUrl === "en") setLang(fromUrl);
      else if (localStorage.getItem("kamai-lang") === "ur") setLang("ur");
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
    try {
      localStorage.setItem("kamai-lang", lang);
    } catch {}
  }, [lang]);

  return (
    <Ctx.Provider value={{ lang, t: dicts[lang], toggle: () => setLang((l) => (l === "en" ? "ur" : "en")) }}>
      {children}
    </Ctx.Provider>
  );
}

export const useT = () => useContext(Ctx);
