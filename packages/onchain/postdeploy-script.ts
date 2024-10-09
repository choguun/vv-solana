import { AnchorProvider, Idl, Program, setProvider, web3, BN } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor'
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { readFileSync } from "fs";
import * as dotenv from 'dotenv';
dotenv.config();

// Replace with your program ID and IDL path
const IDL_PATH = "./target/idl/game_state_program.json";

// Replace with the keypair path of the admin or authority account
const ADMIN_KEYPAIR_PATH = process.env.ANCHOR_WALLET;

// Load the IDL and create the program client
const idl = JSON.parse(readFileSync(IDL_PATH, "utf8"));

// Set up the provider (this assumes you have set up your local environment with a .env file or environment variables)
const provider = AnchorProvider.env();

const program = new Program(idl as Idl, provider);

// Load the admin keypair
const adminKeypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(readFileSync(ADMIN_KEYPAIR_PATH, "utf-8")))
);

// Define the accounts for the instructions

const [worldStatePDA,] = PublicKey.findProgramAddressSync(
  [
    anchor.utils.bytes.utf8.encode('world_state'),
    provider.wallet.publicKey.toBuffer(),
  ],
  program.programId
);

// Post-deployment logic
(async () => {
  try {
    console.log("Initializing World State...");

    // Log the public keys for debugging
    // console.log('Admin Public Key:', adminKeypair.publicKey.toBase58());
    // console.log('WorldState PDA:', worldStatePDA.toBase58());
    // Call the initialize_world_state instruction
    await program.methods
      .initializeWorldState(["Quest 1", "Quest 2"], new BN(1000)) // Replace with your own quest list and treasury amount
      .accounts({
        admin: adminKeypair.publicKey,
        worldState: worldStatePDA,
      })
      .rpc();

    console.log("World State initialized successfully!");

    console.log("Updating Treasury Total...");

    // Call the update_treasury_total instruction
    await program.methods
      .updateTreasuryTotal(new BN(2000)) // Replace with your desired treasury total value
      .accounts({
        admin: adminKeypair.publicKey,
        worldState: worldStatePDA,
      })
      .rpc();

    console.log("Treasury Total updated successfully!");

  } catch (err) {
    console.error("Failed to run post-deployment script:", err);
  }
})();
