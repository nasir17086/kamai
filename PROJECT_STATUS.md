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
10-06 late: product feature-complete for submission (commit c460bf0).
- Program: fund / release(amount) milestones / refund (only remainder). `node web/scripts/e2e.mjs` = 18/18 PASS on localnet.
- Web: create (QR + WhatsApp), pay (+proof link), dashboard (milestones, Proof link), /verify (on-chain proof, no wallet), Urdu RTL toggle (+ ?lang=ur). Static export -> web/out.
- Local: `scripts/rebuild-local.sh` (via wsl-env.sh) = build + copy IDL + restart validator + deploy. Build web vs localnet: NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8899.
- Program ID `61ZkAfTG1tNYA2sDwsKDFCG8MBQRaYWfkRqzfXtos6Zd`; keypairs backed up in Kamai/keys (gitignored).
- Competitor entries are NOT public (Superteam API returns []; listing agentAccess=HUMAN_ONLY -> user must submit personally).
- BLOCKED (user): devnet SOL for wallet `CpSr32anawEMPHUALz9mWxrW79A4Xeb86igVjusNfvvG` (faucet captcha), GitHub account, Colosseum registration, videos.
- After SOL: `anchor deploy --provider.cluster devnet` + `anchor idl init`; build web w/o RPC env; host web/out; fill links in docs/SUBMISSION.md.
- WSL gotcha: multi-command shells via .sh file; from Git Bash set MSYS_NO_PATHCONV=1. Kill the python http.server before rebuilding (locks web/out).
