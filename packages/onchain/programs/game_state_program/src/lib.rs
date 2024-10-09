use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("41FFEKBwumFADAEL99g73gaM5VgxQxmvQCnWCGVyCKqf");

#[program]
pub mod game_state_program {
    use super::*;

    // Initialize the world state PDA
    pub fn initialize_world_state(
        ctx: Context<InitializeWorldState>,
        quests_name: Vec<String>,
        treasury_total: u64,
    ) -> Result<()> {
        if quests_name.len() > WorldState::MAX_QUESTS {
            return Err(ErrorCode::TooManyQuests.into());
        }

        for quest_name in &quests_name {
            if quest_name.len() > WorldState::MAX_QUEST_NAME_LENGTH {
                return Err(ErrorCode::QuestNameTooLong.into());
            }
        }

        let world_state = &mut ctx.accounts.world_state;
        world_state.admin = *ctx.accounts.admin.key;
        world_state.quests_name = quests_name.clone();
        world_state.quests_quota = vec![10; quests_name.len()];
        world_state.treasury_total = treasury_total;
        world_state.bump = ctx.bumps.world_state;

        Ok(())
    }

    // Initialize the player PDA and their inventory
    pub fn create_player(
        ctx: Context<CreatePlayer>,
        username: String,
        character_id: u64,
    ) -> Result<()> {
        if username.len() > Player::MAX_USERNAME_LENGTH {
            return Err(ErrorCode::UsernameTooLong.into());
        }

        let player = &mut ctx.accounts.player;
        player.wallet = *ctx.accounts.wallet.key;
        player.username = username;
        player.character_id = character_id;
        player.points = 0;

        let inventory = &mut ctx.accounts.inventory;
        inventory.player = *ctx.accounts.wallet.key;
        inventory.items = vec![]; // Initialize empty inventory
        inventory.bump = ctx.bumps.inventory;

        Ok(())
    }

    // handler function
    pub fn create_user_stats(ctx: Context<CreateUserStats>, name: String) -> Result<()> {
        let user_stats = &mut ctx.accounts.user_stats;
        user_stats.level = 0;
        if name.as_bytes().len() > 200 {
            // proper error handling omitted for brevity
            panic!();
        }
        user_stats.name = name;
        user_stats.bump = ctx.bumps.user_stats;
        Ok(())
    }

    // handler function (add this next to the create_user_stats function in the game module)
    pub fn change_user_name(ctx: Context<ChangeUserName>, new_name: String) -> Result<()> {
        if new_name.as_bytes().len() > 200 {
            // proper error handling omitted for brevity
            panic!();
        }
        ctx.accounts.user_stats.name = new_name;
        Ok(())
    }

    // Update points for a player
    pub fn update_points(ctx: Context<UpdatePoints>, points: u64) -> Result<()> {
        let player = &mut ctx.accounts.player;
        player.points += points;
        Ok(())
    }

    // Add an item to player's inventory
    pub fn add_item_to_inventory(
        ctx: Context<AddItemToInventory>,
        item_name: String,
        quantity: u64,
    ) -> Result<()> {
        let inventory = &mut ctx.accounts.inventory;

        let mut item_found = false;
        for item in &mut inventory.items {
            if item.name == item_name {
                item.quantity += quantity;
                item_found = true;
                break;
            }
        }

        if !item_found {
            inventory.items.push(Item {
                name: item_name,
                quantity,
            });
        }

        Ok(())
    }

    // Daily check-in function
    pub fn daily_check_in(ctx: Context<DailyCheckInContext>, points: u64) -> Result<()> {
        let player = &mut ctx.accounts.player;
        let daily_check_in = &mut ctx.accounts.daily_check_in;
        let current_timestamp = Clock::get()?.unix_timestamp;
    
        // Check if the account is uninitialized (you can use a field that will only be 0 for uninitialized accounts)
        if daily_check_in.last_check_in == 0 {
            // Perform initialization logic if needed
            daily_check_in.last_check_in = current_timestamp - (24 * 60 * 60); // Set to one day before current time
        }
    
        // Check if the player has already checked in today
        let seconds_in_a_day: i64 = 24 * 60 * 60;
        if current_timestamp - daily_check_in.last_check_in < seconds_in_a_day {
            return Err(ErrorCode::AlreadyCheckedInToday.into());
        }
    
        // Update the last check-in timestamp
        daily_check_in.last_check_in = current_timestamp;
        player.points += points;
    
        Ok(())
    }

    // Function to complete a quest
    pub fn complete_quest(
        ctx: Context<CompleteQuest>,
        reward_amount: u64,
    ) -> Result<()> {
        let world_state = &ctx.accounts.world_state;
    
        // Define the bump seed and signer seeds for the PDA
        let bump = world_state.bump.to_le_bytes();
        let signer_seeds: &[&[u8]] = &[
            b"world_state",              // Seed string used to derive the PDA
            world_state.admin.as_ref(),  // The admin's public key as a seed
            &bump,                       // The bump seed for the PDA
        ];
    
        // Create a longer-lived binding for the signer seeds array
        // Use this binding as the signer seeds in the CpiContext::new_with_signer
        let signer_seeds_binding: &[&[&[u8]]] = &[signer_seeds];
    
        // Mint SPL tokens to the player's associated token account using the world_state PDA as the authority
        let cpi_accounts = MintTo {
            mint: ctx.accounts.reward_mint.to_account_info(),
            to: ctx.accounts.player_reward_token_account.to_account_info(),
            authority: ctx.accounts.world_state.to_account_info(), // Use the world_state PDA as the authority
        };
    
        let cpi_program = ctx.accounts.token_program.to_account_info();
    
        // Create a CpiContext with the longer-lived signer seeds array
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds_binding);
        token::mint_to(cpi_ctx, reward_amount)?;
    
        Ok(())
    }             
}

#[derive(Accounts)]
pub struct InitializeWorldState<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        seeds = [b"world_state", admin.key().as_ref()],  // Seed value used for deriving the PDA
        bump,
        space = 8 + WorldState::MAX_SIZE // Calculate the space for the WorldState struct
    )]
    pub world_state: Account<'info, WorldState>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DailyCheckInContext<'info> {
    #[account(mut)]
    pub player: Account<'info, Player>, // The player's account to update points

    #[account(
        init_if_needed, 
        payer = wallet, 
        space = 8 + 32 + 8 + 1, // 49 bytes for DailyCheckIn account
        seeds = [b"daily-check-in", player.key().as_ref()], 
        bump
    )]
    pub daily_check_in: Account<'info, DailyCheckIn>, // The player's daily check-in account

    #[account(mut)]
    pub wallet: Signer<'info>, // The player's wallet account (must sign the transaction)
    pub system_program: Program<'info, System>,
}

#[account]
pub struct DailyCheckIn {
    pub player: Pubkey,
    pub last_check_in: i64,
    pub bump: u8,
}

impl DailyCheckIn {
    pub const MAX_SIZE: usize = 32 + 8 + 8 + 1;
}

// validation struct
#[derive(Accounts)]
pub struct CreateUserStats<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    // space: 8 discriminator + 2 level + 4 name length + 200 name + 1 bump
    #[account(
        init,
        payer = user,
        seeds = [b"user-stats", user.key().as_ref()],
        bump,
        space = 8 + 2 + 4 + 200 + 1
    )]
    pub user_stats: Account<'info, UserStats>,
    pub system_program: Program<'info, System>,
}

// validation struct
#[derive(Accounts)]
pub struct ChangeUserName<'info> {
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"user-stats", user.key().as_ref()], bump = user_stats.bump)]
    pub user_stats: Account<'info, UserStats>,
}


#[derive(Accounts)]
pub struct CreatePlayer<'info> {
    #[account(
        init_if_needed,
        payer = wallet,
        seeds = [b"player", wallet.key().as_ref()], // Seed for player PDA
        bump,
        space = 8 + Player::MAX_SIZE // Allocate space for the Player struct
    )]
    pub player: Account<'info, Player>, // Player account storing the player's information

    #[account(
        init,
        payer = wallet,
        seeds = [b"inventory", wallet.key().as_ref()], // Seed for inventory PDA
        bump,
        space = 8 + Inventory::MAX_SIZE // Allocate space for the Inventory struct
    )]
    pub inventory: Account<'info, Inventory>, // Player's inventory account

    #[account(mut)]
    pub wallet: Signer<'info>, // The wallet (payer) account, which is also the player
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddItemToInventory<'info> {
    #[account(
        mut,
        seeds = [b"inventory", player.key().as_ref()],
        bump = inventory.bump,
        has_one = player // Ensure that the inventory belongs to the player
    )]
    pub inventory: Account<'info, Inventory>, // Inventory account for adding items
    #[account(mut)]
    pub player: Signer<'info>, // Player who owns the inventory
}

#[derive(Accounts)]
pub struct UpdatePoints<'info> {
    #[account(mut, has_one = wallet)]
    pub player: Account<'info, Player>,
    pub wallet: Signer<'info>,
}

#[derive(Accounts)]
pub struct CompleteQuest<'info> {
    #[account(mut, has_one = admin)]
    pub world_state: Account<'info, WorldState>, // WorldState PDA that manages quests and authorizes minting

    #[account(mut)]
    pub player: Signer<'info>, // Player's wallet account signing the transaction

    /// CHECK: This is the reward mint for the SPL token, no further validation is needed.
    #[account(mut)]
    pub reward_mint: UncheckedAccount<'info>, // Use UncheckedAccount for the Mint type

    /// CHECK: This is the player's token account for receiving rewards, no further validation is needed.
    #[account(mut)]
    pub player_reward_token_account: UncheckedAccount<'info>, // Use UncheckedAccount for TokenAccount

    #[account(mut)]
    pub admin: Signer<'info>, // Admin account that manages the world_state

    pub system_program: Program<'info, System>, // System program
    pub token_program: Program<'info, Token>, // SPL Token program
    pub associated_token_program: Program<'info, AssociatedToken>, // Associated token program
    pub rent: Sysvar<'info, Rent>, // Rent sysvar
}

impl Player {
    pub const MAX_SIZE: usize = DISCRIMINATOR + 32 + 4 + 32 + 8 + 8;
    pub const MAX_USERNAME_LENGTH: usize = 32;
}

impl WorldState {
    pub const MAX_SIZE: usize = DISCRIMINATOR + 32 + 4 + (32 * 50) + 8;
    pub const MAX_QUESTS: usize = 50;
    pub const MAX_QUEST_NAME_LENGTH: usize = 32;
}

#[account]
pub struct UserStats {
    level: u16,
    name: String,
    bump: u8,
}

#[account]
pub struct Player {
    pub wallet: Pubkey,
    pub username: String,
    pub character_id: u64,
    pub points: u64,
}

#[account]
pub struct WorldState {
    pub admin: Pubkey,
    pub quests_name: Vec<String>,
    pub quests_quota: Vec<u64>,
    pub treasury_total: u64,
    pub bump: u8,
}

#[account]
pub struct Inventory {
    pub player: Pubkey,
    pub items: Vec<Item>,
    pub bump: u8,
}

impl Inventory {
    pub const MAX_SIZE: usize = 32 + 4 + (50 * (4 + 32 + 8)) + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Item {
    pub name: String,
    pub quantity: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Too many quests")]
    TooManyQuests,
    #[msg("Quest name too long")]
    QuestNameTooLong,
    #[msg("Username too long")]
    UsernameTooLong,
    #[msg("Quest not found")]
    QuestNotFound,
    #[msg("You have already checked in today.")]
    AlreadyCheckedInToday, // Add this missing variant
}

const DISCRIMINATOR: usize = 8;