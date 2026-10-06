# Kamai — submission pack

Copy-paste text for Colosseum (Crypto World's Fair) and the Superteam Earn Pakistan Track, plus the two video scripts.

## Short fields

- **Project name:** Kamai
- **One-liner:** Escrow payment links that get Pakistani freelancers paid in USDC in seconds, with no scams and no 3% cut.
- **Category / track:** Payments & FinTech (also: Stablecoins, Consumer)
- **Country:** Pakistan
- **Program ID (devnet):** `61ZkAfTG1tNYA2sDwsKDFCG8MBQRaYWfkRqzfXtos6Zd`
- **Live demo:** `<fill after hosting>`
- **GitHub:** `<fill after repo is created>`
- **Pitch video:** `<YouTube unlisted link>`
- **Technical demo video:** `<YouTube unlisted link>`

## Description (long)

Pakistan has one of the world's largest freelance workforces. Getting paid is still the hardest part of the job. Payoneer and bank wires cost 2–3%+ and take days. Direct clients found on WhatsApp, Facebook and LinkedIn often disappear after delivery or send fake "payment sent" screenshots. Neither side trusts the other enough to pay or work first.

Kamai is a payment link backed by an on-chain escrow. The freelancer creates an invoice (job, USDC amount, delivery days) and shares the link or QR code. The client pays, and the USDC is locked in an escrow account owned by the Kamai Solana program. The freelancer can see the money is real before starting work. When the client approves, the funds reach the freelancer's wallet in under a second for a fraction of a cent. If the freelancer cancels, or the deadline passes, the client gets a full refund. There's no custody, no sign-up and no backend. The invoice is just a URL, and every rule is enforced by an Anchor program.

Why Solana: sub-second finality and fees under $0.001 make escrow viable even for $20 gigs. USDC (and Token-2022 stablecoins, via `token_interface`) gives freelancers dollar earnings without a bank in the middle.

What's built:
- An Anchor program with `fund`, `release` and `refund` (PDA escrow + vault, closed on settlement).
- A Next.js app with an invoice creator, QR code, pay page, dashboard and PKR estimates.
- 13 end-to-end tests that all pass.

Next steps:
- milestone payments and an optional arbiter;
- a PKR off-ramp through local exchanges and EMIs (Raast);
- a WhatsApp invoice bot;
- an on-chain reputation history that works as a freelancer CV.

## Pitch video script (≤ 3 min, face + slides)

1. **(0:00–0:25) Hook.** *(Use your own real story, or a real one you know about. Don't invent one.)* "Salaam, I'm ___ from Pakistan. Last year a client of mine got the work, sent a fake payment screenshot, and disappeared. Every Pakistani freelancer has a story like this. And when we *do* get paid, Payoneer and banks take 3% and five days."
2. **(0:25–0:50) Problem in numbers.** Pakistan's freelance economy is huge, but payments are slow, costly and built on trust. Clients don't want to pay first, and freelancers can't afford to work first.
3. **(0:50–1:30) Solution.** "Kamai is a payment link with an escrow built in. I send my client a link. They pay USDC into a Solana program, not to me. I can *see* the money is locked before I start. They approve, and I'm paid in under a second for less than one rupee. If I don't deliver, they get a full refund automatically after the deadline."
4. **(1:30–2:00) Why now / why Solana.** Fees and speed make escrow work even for small gigs. USDC gives freelancers dollar income. No bank, no platform cut, no custody.
5. **(2:00–2:35) Business.** "Free for now. Later: a 0.5% fee on release, milestone invoices, and a PKR cash-out through licensed local partners. That's still 5× cheaper than today."
6. **(2:35–3:00) Close.** "Kamai means earnings. We want every Pakistani freelancer to keep all of theirs. Thank you."

## Technical demo script (≤ 3 min, screen recording)

Before recording: install Phantom, switch it to Devnet, make two accounts ("Freelancer" and "Client"), fund both with devnet SOL, and fund the Client with devnet USDC from faucet.circle.com.

1. Open the live app and connect the **Freelancer** account. Type "WordPress site, 5 pages", 50 USDC, 7 days, then click **Create payment link**. Show the PKR estimate and the QR code.
2. Copy the link, switch Phantom to the **Client** account and open the link. Show the "How this protects you" box, click **Pay 50 USDC into escrow**, approve in Phantom, then open the Solana Explorer link.
3. **Dashboard** (Client): the invoice shows as *In escrow*. Show the escrow account on Explorer holding 50 USDC.
4. Click **Approve & pay**, then switch to the Freelancer: the USDC balance went up by 50 almost instantly.
5. Quick second invoice: the Freelancer clicks **Cancel & refund**, and the Client gets the money back.
6. Show `program-src/lib.rs` for 20 seconds (the release and refund rules), then run `node scripts/e2e.mjs`: 13 passed.

## Checklist before submitting (deadline: Superteam 13 Oct 11:59 AM PKT; Colosseum, check the site)

- [ ] Devnet SOL in the deploy wallet → Claude deploys the program + IDL to devnet
- [ ] GitHub account → Claude pushes the repo
- [ ] Hosting → Claude publishes `web/out/`
- [ ] Record both videos and upload them to YouTube as unlisted
- [ ] Register at colosseum.com, country = Pakistan, and submit the project there
- [ ] Superteam Earn: submit the Colosseum project link + GitHub on the Pakistan Track listing
