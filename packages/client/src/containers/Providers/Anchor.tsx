import React, { createContext, useContext, useEffect, useState } from 'react';
import { AnchorProvider, Idl, Program, setProvider, web3, BN } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from "@solana/web3.js";
import idl from 'onchain/target/idl/game_state_program.json'; // Adjust path to your IDL file
import toast from 'react-hot-toast';
// import { TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import { SPL_PUBLIC_KEY } from '../../env';

// Create a context to hold the program and provider information
const AnchorContext = createContext(null);

export const useAnchor = () => {
  return useContext(AnchorContext);
};

export const AnchorProviderContext: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [program, setProgram] = useState<any>(null);

  const provider = new AnchorProvider(connection, wallet, {});
  setProvider(provider);

  // async function getPlayerTokenAccount(provider, rewardMint) {
  //   // Fetch the wallet public key (assumes the wallet is connected)
  //   const walletPublicKey = provider.wallet.publicKey;
  
  //   // Get or create the associated token account for the player
  //   const tokenAccount = await getOrCreateAssociatedTokenAccount(
  //     provider.connection,            // Solana connection
  //     provider.wallet.payer,          // Payer of the associated token account creation
  //     rewardMint,                     // SPL token mint address
  //     walletPublicKey                 // Owner of the token account
  //   );
  
  //   console.log("Player's associated token account:", tokenAccount.address.toString());
  //   return tokenAccount.address;
  // }

  const associatedTokenProgram = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

  // Function to get the reward mint address
  async function getRewardMintAddress() {
    // Replace with your known reward mint address or use a constant if you created it
    const rewardMint = new PublicKey(SPL_PUBLIC_KEY);
    return rewardMint;
  }

  const createPlayerAccount = async (name: string, characterId: number) => {
    toast.loading("Create Account...");
    const playerPublicKey = provider.wallet.publicKey;

    const [playerPDA,] = PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode('player'),
        playerPublicKey.toBuffer(),
      ],
      program.programId
    );

    try {
      await program.methods
      .createPlayer(name, new anchor.BN(characterId)) // Ensure you use `anchor.BN` for BN types
      .accounts({
        user: playerPublicKey,
        player: playerPDA, // Player PDA account
      })
      .rpc();

      console.log("success...");
      toast.success("Player account created successfully!");
    } catch (error) {
      console.error("Transaction error: ", error);
      toast.error("Failed to create player account");
    }
  }

  const dailyCheckIn = async () => {
    toast.loading("Checking In...");
    const playerPublicKey = provider.wallet.publicKey;

    const [playerPDA,] = PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode('player'),
        playerPublicKey.toBuffer(),
      ],
      program.programId
    );

    const [dailyCheckInPDA,] = PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode('daily_check_in'),
        playerPublicKey.toBuffer(),
      ],
      program.programId
    );

    try {
      await program.methods
      .dailyCheckIn(new anchor.BN(100)) // Ensure you use `anchor.BN` for BN types
      .accounts({
        user: playerPublicKey,
        player: playerPDA, // Player PDA account
        daily_check_in: dailyCheckInPDA,
        wallet: playerPublicKey, // The wallet (signer) should be passed here
      })
      .rpc();

      console.log("success...");
      toast.success("Daily Check-in successfully!");
    } catch (error) {
      console.error("Transaction error: ", error);
      toast.error("Failed to daily Check-in");
    }
  }

  // Function to call complete_quest
  const completeQuest = async () => {
  try {
    // Fetch the necessary public keys
    const rewardMint = await getRewardMintAddress();
    const playerTokenAccount = await getPlayerTokenAccount(provider, rewardMint);

    // Find the WorldState PDA address
    const admin = provider.wallet.publicKey; // Admin is the wallet signer here
    const [worldStatePDA,] = PublicKey.findProgramAddressSync(
      [Buffer.from("world_state"), admin.toBuffer()],
      program.programID
    );

    // Execute the complete_quest function on the program
    const tx = await program.rpc.completeQuest(
      new BN(1000), // Replace with the reward amount to mint
      {
        accounts: {
          worldState: worldStatePDA,
          player: provider.wallet.publicKey,
          rewardMint: rewardMint,
          playerRewardTokenAccount: playerTokenAccount,
          admin: admin,
          systemProgram: SystemProgram.programId,
          tokenProgram: "TOKEN_PROGRAM_ID",
          associatedTokenProgram: associatedTokenProgram,
          rent: web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [],
      }
    );

    console.log("Transaction successful with signature:", tx);
  } catch (err) {
    console.error("Failed to complete quest:", err);
  }
}


  const fetchCharacter = async () => {
    console.log("fetchCharacter: ");
    if(program) {
      const playerPublicKey = provider.wallet.publicKey;
      const [playerPDA,] = PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode('player'),
          playerPublicKey.toBuffer(),
        ],
        program.programId
      );

      const player = await program.account.player.fetch(playerPDA);
      const result = player.characterId.toNumber();
      return result;
    }
  }

  const fetchPlayerPoint = async () => {
    console.log("fetchPlayerPoint: ");
    if(program) {
      const playerPublicKey = provider.wallet.publicKey;
      const [playerPDA,] = PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode('player'),
          playerPublicKey.toBuffer(),
        ],
        program.programId
      );

      const player = await program.account.player.fetch(playerPDA);
      // console.log(player);
      const result = player.points.toNumber();
      return result;
    }
  }

  useEffect(() => {
    if (wallet) {
      const provider = new AnchorProvider(connection, wallet, {});
      setProvider(provider);

      // Initialize the program using the IDL and program ID
      const anchorProgram = new Program(idl as Idl, provider);
      console.log("Program initialized...");
      // console.log(anchorProgram);
      setProgram(anchorProgram);
    }
  }, [wallet, connection]);

  return (
    <AnchorContext.Provider value={{ createPlayerAccount, dailyCheckIn, completeQuest, fetchCharacter, fetchPlayerPoint, program }}>
      {children}
    </AnchorContext.Provider>
  );
};
