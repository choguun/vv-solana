import { stringToHex } from "viem";

import type { KnownWorldName } from "./types";

export enum Direction {
  Top,
  Right,
  Bottom,
  Left,
}

export const Directions = {
  [Direction.Top]: { x: 0, y: -1 },
  [Direction.Right]: { x: 1, y: 0 },
  [Direction.Bottom]: { x: 0, y: 1 },
  [Direction.Left]: { x: -1, y: 0 },
};
export const BYTES32_ZERO =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
export const SPAWN_SETTLEMENT = stringToHex("SpawnSettlement", { size: 32 });
export const EMOJI = "🔮";

export const LOCK_CLIENT = false;

export const SEASON_NAME = "Season 1";

/* -------------------------------------------------------------------------- */
/*                                    LINKS                                   */
/* -------------------------------------------------------------------------- */
export const youtubeLink = "";
export const githubLink = "";
export const linkedInLink = "";
export const twitterLink = "";
export const mailLink = "";
export const buyMeACoffeeLink = "";
export const discordLink = "";

export const voxelizeWorldLocalStorageKey = "voxelverses-world-name";
const potentialWorldName =
  new URLSearchParams(window.location.search).get("world") ??
  localStorage.getItem(voxelizeWorldLocalStorageKey) ??
  "terrain";
export const knownWorlds: KnownWorldName[] = [
  "main",
  "flat",
  "flat2",
  "lab",
  "terrain",
];
export const editableWorlds: KnownWorldName[] = ["flat", "flat2", "terrain"];
export const currentWorldName = knownWorlds.includes(
  potentialWorldName as KnownWorldName
)
  ? (potentialWorldName as KnownWorldName)
  : knownWorlds[0];

/* -------------------------------------------------------------------------- */
/*                                   COLORS                                   */
/* -------------------------------------------------------------------------- */
export const grayReplacement = "#C7C8CC";

export const characterModels = [
  "",
  "./assets/models/male1_model.glb",
  "./assets/models/male2_model.glb",
  "./assets/models/male3_model.glb",
  "./assets/models/female1_model.glb",
  "./assets/models/female2_model.glb",
  "./assets/models/female3_model.glb",
];

export const FAUCET_URL = "https://www.bnbchain.org/en/testnet-faucet";
export const BRIDGE_URL = "https://faucet.solana.com/";
export const CHAIN_NAME = "Solana Devnet";

export const NATIVE_SYMBOL = "SOL";
