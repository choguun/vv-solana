const {
  VITE_BSC_RPC_URL,
  VITE_BSC_CHAIN_ID,
  VITE_EXPLORER_URL,
  VITE_GRPC_URL,

  VITE_WORLD_CONTRACT,
  VITE_PROFILE_CONTRACT,
  VITE_TOKEN_CONTRACT,
  VITE_REGISTRY_CONTRACT,
  VITE_ACCOUNT_CONTRACT,
  VITE_ITEM_CONTRACT,
  VITE_NPC_CONTRACT,
  VITE_VAULT_CONTRACT,

  VITE_APP_PROJECT_ID,
  VITE_APP_CLIENT_KEY,
  VITE_APP_APP_ID,
  VITE_SPL_PUBLIC_KEY,
} = import.meta.env;

export const BSC_RPC_URL = VITE_BSC_RPC_URL as string;
export const BSC_CHAIN_ID = Number(VITE_BSC_CHAIN_ID);
export const EXPLORER_URL = VITE_EXPLORER_URL;
export const GRPC_URL = VITE_GRPC_URL;

export const WORLD_CONTRACT = VITE_WORLD_CONTRACT;
export const PROFILE_CONTRACT = VITE_PROFILE_CONTRACT;
export const TOKEN_CONTRACT = VITE_TOKEN_CONTRACT;
export const REGISTRY_CONTRACT = VITE_REGISTRY_CONTRACT;
export const ACCOUNT_CONTRACT = VITE_ACCOUNT_CONTRACT;
export const ITEM_CONTRACT = VITE_ITEM_CONTRACT;
export const NPC_CONTRACT = VITE_NPC_CONTRACT;
export const VAULT_CONTRACT = VITE_VAULT_CONTRACT;

export const APP_PROJECT_ID = VITE_APP_PROJECT_ID;
export const APP_CLIENT_KEY = VITE_APP_CLIENT_KEY;
export const APP_APP_ID = VITE_APP_APP_ID;

export const SPL_PUBLIC_KEY = VITE_SPL_PUBLIC_KEY;
