use anchor_lang::prelude::*;

declare_id!("7E3RDUeCU9VdJ8KXPg9boz94iWcHnvBDV5JwMckbQ9gS");


#[program]
pub mod game_state_program {
    use super::*;

    pub fn initialize_world_state(
        ctx: Context<InitializeWorldState>,
        quests: Vec<String>,
        treasury_total: u64,
    ) -> Result<()> {
        let world_state = &mut ctx.accounts.world_state;
        world_state.admin = *ctx.accounts.admin.key;
        world_state.quests = quests;
        world_state.treasury_total = treasury_total;
        Ok(())
    }

    pub fn add_player(
        ctx: Context<AddPlayer>,
        username: String,
        character_id: u64,
    ) -> Result<()> {
        let player = &mut ctx.accounts.player;
        player.wallet = *ctx.accounts.wallet.key;
        player.username = username;
        player.character_id = character_id;
        player.points = 0;
        Ok(())
    }

    pub fn update_points(
        ctx: Context<UpdatePoints>,
        points: u64,
    ) -> Result<()> {
        let player = &mut ctx.accounts.player;
        player.points = points;
        Ok(())
    }

    pub fn update_treasury_total(
        ctx: Context<UpdateTreasuryTotal>,
        treasury_total: u64,
    ) -> Result<()> {
        let world_state = &mut ctx.accounts.world_state;
        world_state.treasury_total = treasury_total;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeWorldState<'info> {
    #[account(init, payer = admin, space = DISCRIMINATOR + 32 + 4 + (32 * 50) + 8)]
    pub world_state: Account<'info, WorldState>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddPlayer<'info> {
    #[account(init, payer = wallet, space = DISCRIMINATOR + 32 + 32 + 8 + 8)]
    pub player: Account<'info, Player>,
    #[account(mut)]
    pub wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePoints<'info> {
    #[account(mut, has_one = wallet)]
    pub player: Account<'info, Player>,
    pub wallet: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateTreasuryTotal<'info> {
    #[account(mut, has_one = admin)]
    pub world_state: Account<'info, WorldState>,
    pub admin: Signer<'info>,
}

#[account]
pub struct Player {
    pub wallet: Pubkey,        // Wallet address of the player
    pub username: String,      // Username associated with wallet address
    pub character_id: u64,     // Character ID associated with wallet address
    pub points: u64,           // Points for the player
}

#[account]
pub struct WorldState {
    pub admin: Pubkey,         // Admin of the world state
    pub quests: Vec<String>,   // List of quests available in the game
    pub treasury_total: u64,   // Total treasury for the game
}

const DISCRIMINATOR: usize = 8;