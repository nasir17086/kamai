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
10-06 night: Day 1 DONE + most of Day 2.
- Program builds (Anchor 1.1.2 fixes: `Context<'info,T>`, `CpiContext::new(program_id_pubkey,..)`, helper takes `&Settle`).
- Program ID `61ZkAfTG1tNYA2sDwsKDFCG8MBQRaYWfkRqzfXtos6Zd`; keypair only in WSL ~/kamai/target/deploy (BACK IT UP before devnet deploy).
- LOCAL validator: `scripts/localnet.sh` (via wsl-env.sh) starts solana-test-validator + deploys. Windows reaches it at http://127.0.0.1:8899.
- `node web/scripts/e2e.mjs` = 13/13 PASS (fund, release, auth, double-fund, freelancer cancel, deadline refund, validation).
- TS client gotchas: pass `tokenProgram: TOKEN_PROGRAM_ID`; release/refund need `accountsPartial({... escrow })` (escrow seed is self-referential). Pages patched; `npm run build` OK.
- BLOCKED for devnet: deploy wallet `CpSr32anawEMPHUALz9mWxrW79A4Xeb86igVjusNfvvG` has 0 devnet SOL. CLI airdrop 429; faucet.solana.com needs captcha -> USER. Retry `solana airdrop 2` later (limit resets).
- Next: devnet deploy + `anchor idl init`; run e2e.mjs against devnet; host web (static export -> Vercel/Hostinger); UI polish + PKR; README/pitch/demo.
- WSL gotcha: run multi-command shells via a .sh file (`$(...)` inline gets eaten); from Git Bash set MSYS_NO_PATHCONV=1.
