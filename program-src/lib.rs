use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked, CloseAccount},
};

declare_id!("61ZkAfTG1tNYA2sDwsKDFCG8MBQRaYWfkRqzfXtos6Zd");

pub const MAX_TITLE: usize = 64;

#[program]
pub mod kamai {
    use super::*;

    /// Client funds an invoice: USDC moves from the client into a vault owned by the escrow PDA.
    pub fn fund(ctx: Context<Fund>, invoice_id: u64, amount: u64, deadline: i64, title: String) -> Result<()> {
        require!(amount > 0, KamaiError::ZeroAmount);
        require!(title.len() <= MAX_TITLE, KamaiError::TitleTooLong);
        require!(deadline > Clock::get()?.unix_timestamp, KamaiError::DeadlineInPast);
        require_keys_neq!(ctx.accounts.client.key(), ctx.accounts.freelancer.key(), KamaiError::SamePerson);

        let escrow = &mut ctx.accounts.escrow;
        escrow.client = ctx.accounts.client.key();
        escrow.freelancer = ctx.accounts.freelancer.key();
        escrow.mint = ctx.accounts.mint.key();
        escrow.invoice_id = invoice_id;
        escrow.amount = amount;
        escrow.released = 0;
        escrow.deadline = deadline;
        escrow.created_at = Clock::get()?.unix_timestamp;
        escrow.status = Status::Funded as u8;
        escrow.title = title;
        escrow.bump = ctx.bumps.escrow;

        token_interface::transfer_checked(
            CpiContext::new(
                ctx.accounts.token_program.key(),
                TransferChecked {
                    from: ctx.accounts.client_token.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                    authority: ctx.accounts.client.to_account_info(),
                },
            ),
            amount,
            ctx.accounts.mint.decimals,
        )?;

        emit!(EscrowEvent { escrow: escrow.key(), status: Status::Funded as u8, amount });
        Ok(())
    }

    /// Client approves work: the vault pays the freelancer `amount`.
    /// Partial amounts are milestone payments; releasing the remainder completes the invoice.
    pub fn release(ctx: Context<Settle>, amount: u64) -> Result<()> {
        let escrow = &ctx.accounts.escrow;
        require!(escrow.status == Status::Funded as u8, KamaiError::NotFunded);
        require_keys_eq!(ctx.accounts.signer.key(), escrow.client, KamaiError::Unauthorized);
        let remaining = escrow.amount - escrow.released;
        require!(amount > 0 && amount <= remaining, KamaiError::BadReleaseAmount);
        let to = ctx.accounts.freelancer_token.to_account_info();
        if amount == remaining {
            payout_and_close(&ctx.accounts, to, amount)?;
            ctx.accounts.escrow.status = Status::Released as u8;
        } else {
            payout(&ctx.accounts, to, amount)?;
        }
        ctx.accounts.escrow.released += amount;
        emit!(EscrowEvent { escrow: ctx.accounts.escrow.key(), status: ctx.accounts.escrow.status, amount });
        Ok(())
    }

    /// Refund to the client: the freelancer can cancel at any time,
    /// the client can reclaim only after the deadline has passed.
    pub fn refund(ctx: Context<Settle>) -> Result<()> {
        let escrow = &ctx.accounts.escrow;
        require!(escrow.status == Status::Funded as u8, KamaiError::NotFunded);
        let signer = ctx.accounts.signer.key();
        let now = Clock::get()?.unix_timestamp;
        let allowed = signer == escrow.freelancer || (signer == escrow.client && now > escrow.deadline);
        require!(allowed, KamaiError::RefundNotAllowed);
        // Only what has not been released yet goes back to the client.
        let remaining = escrow.amount - escrow.released;
        let to = ctx.accounts.client_token.to_account_info();
        payout_and_close(&ctx.accounts, to, remaining)?;
        ctx.accounts.escrow.status = Status::Refunded as u8;
        emit!(EscrowEvent { escrow: ctx.accounts.escrow.key(), status: Status::Refunded as u8, amount: remaining });
        Ok(())
    }
}

fn payout<'info>(a: &Settle<'info>, to: AccountInfo<'info>, amount: u64) -> Result<()> {
    let escrow = &a.escrow;
    let id = escrow.invoice_id.to_le_bytes();
    let seeds: &[&[u8]] = &[b"escrow", escrow.client.as_ref(), escrow.freelancer.as_ref(), &id, &[escrow.bump]];
    token_interface::transfer_checked(
        CpiContext::new_with_signer(
            a.token_program.key(),
            TransferChecked {
                from: a.vault.to_account_info(),
                mint: a.mint.to_account_info(),
                to,
                authority: a.escrow.to_account_info(),
            },
            &[seeds],
        ),
        amount,
        a.mint.decimals,
    )
}

fn payout_and_close<'info>(a: &Settle<'info>, to: AccountInfo<'info>, amount: u64) -> Result<()> {
    payout(a, to, amount)?;
    let escrow = &a.escrow;
    let id = escrow.invoice_id.to_le_bytes();
    let seeds: &[&[u8]] = &[b"escrow", escrow.client.as_ref(), escrow.freelancer.as_ref(), &id, &[escrow.bump]];
    let signer = &[seeds];

    // Vault is empty now; close it and return its rent to the client who paid for it.
    token_interface::close_account(CpiContext::new_with_signer(
        a.token_program.key(),
        CloseAccount {
            account: a.vault.to_account_info(),
            destination: a.client.to_account_info(),
            authority: a.escrow.to_account_info(),
        },
        signer,
    ))
}

#[derive(Accounts)]
#[instruction(invoice_id: u64)]
pub struct Fund<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
    /// CHECK: only stored as the payee; never read or written.
    pub freelancer: UncheckedAccount<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
        init,
        payer = client,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [b"escrow", client.key().as_ref(), freelancer.key().as_ref(), &invoice_id.to_le_bytes()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        init,
        payer = client,
        associated_token::mint = mint,
        associated_token::authority = escrow,
        associated_token::token_program = token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = client,
        associated_token::token_program = token_program
    )]
    pub client_token: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Settle<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    /// CHECK: must match escrow.client (enforced by has_one); receives vault rent.
    #[account(mut)]
    pub client: UncheckedAccount<'info>,
    /// CHECK: must match escrow.freelancer (enforced by has_one).
    pub freelancer: UncheckedAccount<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        has_one = client,
        has_one = freelancer,
        has_one = mint,
        seeds = [b"escrow", client.key().as_ref(), freelancer.key().as_ref(), &escrow.invoice_id.to_le_bytes()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = escrow,
        associated_token::token_program = token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = freelancer,
        associated_token::token_program = token_program
    )]
    pub freelancer_token: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = client,
        associated_token::token_program = token_program
    )]
    pub client_token: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub client: Pubkey,
    pub freelancer: Pubkey,
    pub mint: Pubkey,
    pub invoice_id: u64,
    pub amount: u64,
    pub released: u64,
    pub deadline: i64,
    pub created_at: i64,
    pub status: u8,
    pub bump: u8,
    #[max_len(64)]
    pub title: String,
}

#[repr(u8)]
pub enum Status {
    Funded = 0,
    Released = 1,
    Refunded = 2,
}

#[event]
pub struct EscrowEvent {
    pub escrow: Pubkey,
    pub status: u8,
    pub amount: u64,
}

#[error_code]
pub enum KamaiError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Title is longer than 64 bytes")]
    TitleTooLong,
    #[msg("Deadline must be in the future")]
    DeadlineInPast,
    #[msg("Client and freelancer must be different wallets")]
    SamePerson,
    #[msg("Escrow is not in the Funded state")]
    NotFunded,
    #[msg("Only the client can release funds")]
    Unauthorized,
    #[msg("Release amount must be more than 0 and at most what is left in escrow")]
    BadReleaseAmount,
    #[msg("Refund allowed only by the freelancer, or by the client after the deadline")]
    RefundNotAllowed,
}
