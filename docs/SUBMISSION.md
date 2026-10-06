# Kamai — submission pack

Copy-paste text for Colosseum (Crypto World's Fair) and the Superteam Earn Pakistan Track, plus the two video scripts.

## Short fields

- **Project name:** Kamai
- **One-liner:** Escrow payment links that get Pakistani freelancers paid in USDC in seconds, with no scams and no 3% cut.
- **Category / track:** Payments & FinTech (also: Stablecoins, Consumer)
- **Country:** Pakistan
- **Program ID (devnet):** `61ZkAfTG1tNYA2sDwsKDFCG8MBQRaYWfkRqzfXtos6Zd`
- **Live demo:** https://nasir17086.github.io/kamai/
- **Live on-chain proof example:** https://nasir17086.github.io/kamai/verify/?e=7Z2439dEmcZmhYc2cvgpphotaveeJbBKFq3gEMgGtLkD
- **GitHub:** https://github.com/nasir17086/kamai
- **Pitch video:** https://youtu.be/8dwq74mJ3A4
- **Technical demo video:** https://youtu.be/bz8M_5BsK7w

## Description (long)

Pakistan has one of the world's largest freelance workforces. Getting paid is still the hardest part of the job. Payoneer and bank wires cost 2–3%+ and take days. Direct clients found on WhatsApp, Facebook and LinkedIn often disappear after delivery or send fake "payment sent" screenshots. Neither side trusts the other enough to pay or work first.

Kamai is a payment link backed by an on-chain escrow. The freelancer creates an invoice (job, USDC amount, delivery days) and shares the link or QR code. The client pays, and the USDC is locked in an escrow account owned by the Kamai Solana program. Anyone can open a public proof link that reads the escrow straight from Solana, so a fake "payment sent" screenshot no longer works. The client releases the money all at once or per milestone, and each release reaches the freelancer's wallet in under a second for a fraction of a cent. If the freelancer cancels, or the deadline passes, the client gets back whatever has not been released. The app is fully bilingual (Urdu right-to-left and English) and shares invoices on WhatsApp in one tap. There's no custody, no sign-up and no backend. The invoice is just a URL, and every rule is enforced by an Anchor program.

Why Solana: sub-second finality and fees under $0.001 make escrow viable even for $20 gigs. USDC (and Token-2022 stablecoins, via `token_interface`) gives freelancers dollar earnings without a bank in the middle.

What's built:
- An Anchor program with `fund`, `release(amount)` (milestones) and `refund` (PDA escrow + vault, closed on settlement).
- A Next.js app with an invoice creator (QR code + WhatsApp), pay page, milestone dashboard, a public on-chain verify page, an Urdu/English UI and PKR estimates.
- 18 end-to-end tests that all pass.

Next steps:
- an optional arbiter for disputes;
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
4. Type 20 in **Milestone** and click **Release part**: the Freelancer gets 20 instantly. Open the **Proof** link to show the verify page, with 20 paid and 30 still locked. Switch to **اردو** for a few seconds.
5. Click **Pay the rest**: the invoice shows as *Released*.
6. Quick second invoice: the Freelancer clicks **Cancel & refund**, and the Client gets the money back.
7. Show `program-src/lib.rs` for 20 seconds (the release and refund rules), then run `node scripts/e2e.mjs`: 18 passed.

## Checklist before submitting (deadline: Superteam 13 Oct 11:59 AM PKT; Colosseum, check the site)

- [x] Program deployed to devnet (slot 508148729); e2e 18/18 PASS on devnet
- [x] GitHub repo: https://github.com/nasir17086/kamai
- [x] Hosted on GitHub Pages (gh-pages branch)
- [x] Videos on YouTube (KAMAI channel, unlisted): pitch https://youtu.be/8dwq74mJ3A4 · demo https://youtu.be/bz8M_5BsK7w
- [ ] Register at colosseum.com, country = Pakistan, and submit the project there
- [ ] Superteam Earn: submit the Colosseum project link + GitHub on the Pakistan Track listing
