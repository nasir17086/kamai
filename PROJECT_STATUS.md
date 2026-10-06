# Kamai — PROJECT STATUS

USDC escrow invoices for Pakistani freelancers, on Solana.
Entry for **Colosseum Crypto World's Fair** (deadline 2026-10-12) + **Superteam Pakistan Track** on Superteam Earn
(slug `crypto-worlds-fair-pakistan-track`, $5k pool, Superteam deadline 2026-10-13 11:59 AM PKT).

## Pitch in one line
A freelancer sends an invoice link; the client pays USDC into an on-chain escrow; funds release on approval
or refund after the deadline. Settles in seconds for < $0.01, versus 2–3% and days with Payoneer/banks.

## Layout
- `program-src/lib.rs` — Anchor program (fund / release / refund). Copied into the Anchor workspace in WSL to build.
- `web/` — Next.js app (wallet connect, create invoice link, pay page, dashboard).

## Toolchain
- WSL `Ubuntu-24.04` (root), Rust + Solana CLI + Anchor via solana-install script.
- PATH in WSL: `source ~/.cargo/env; export PATH=$HOME/.local/share/solana/install/active_release/bin:$HOME/.avm/bin:$PATH`

## Plan
| Day | Date | Work |
|---|---|---|
| 1 | 10-06 | Toolchain, program, scaffold web |
| 2 | 10-07 | Program tests + devnet deploy; web: create invoice + pay |
| 3 | 10-08 | Dashboard, release/refund, PKR estimate, polish |
| 4 | 10-09 | Host web app; end-to-end devnet test with 2 wallets |
| 5 | 10-10 | Pitch deck, demo video (user records voice/face), README |
| 6 | 10-11 | Submit to Colosseum + Superteam Earn (user clicks submit) |

## User to-do (Claude can't create accounts)
- [ ] Phantom wallet (switch to Devnet for testing)
- [ ] Register at colosseum.com/worldsfair, country = Pakistan
- [ ] Superteam Earn account
- [ ] GitHub account/repo for the code (needed for submission)

## RESUME HERE
10-06 late: LIVE.
- Program on DEVNET (slot 508148729). e2e on devnet: `FUNDER=../keys/id.json node scripts/e2e.mjs https://api.devnet.solana.com` = 18/18. Demo escrow 7Z2439dEmcZmhYc2cvgpphotaveeJbBKFq3gEMgGtLkD (test mint).
- GitHub: https://github.com/nasir17086/kamai (main). Site: https://nasir17086.github.io/kamai/ (gh-pages branch).
- Redeploy site: kill http.server; `MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH=/kamai npm run build`; touch out/.nojekyll; copy out/. into a FRESH temp dir; git init -b gh-pages; force-push.
- On-chain IDL upload failed (anchor 1.x missing helper) - optional, web bundles IDL.
- Colosseum: user REGISTERED 10-06 (username nasir17086).
- DEMO VIDEO DONE: video/Kamai-demo.mp4 (1:22, captions; gitignored). Re-record: build with NEXT_PUBLIC_USDC_MINT=<keys/demo.json mint>, serve out/ on :4321, `node scripts/cancel-stale.mjs` then `node scripts/record-demo.mjs`; ffmpeg = Noor-ul-Quran/node_modules/ffmpeg-static/ffmpeg.exe.
- Fixed real bug 10-06: dashboard crashed (r.pubkey vs Anchor publicKey) - live site redeployed.
- Remaining (user): pitch video (voice over slides), upload both videos to YouTube (unlisted), record 2 videos (scripts in docs/SUBMISSION.md), submit Colosseum (deadline 10-12) + Superteam (HUMAN_ONLY, 10-13 11:59 AM PKT).
- Gotchas: Git Bash mangles "/kamai" -> use MSYS_NO_PATHCONV=1. Push works after user's one-time GCM login.
