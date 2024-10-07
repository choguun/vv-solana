/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from "react";

import { transportObserver } from "@latticexyz/common";
import { transactionQueue } from "@latticexyz/common/actions";
// import { useAccount, useEmbeddedWallet, useWallets } from "@particle-network/connectkit";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import {
  createPublicClient,
  fallback,
  webSocket,
  http,
  getContract,
  Hex,
} from "viem";
import { useWalletClient, useAccount } from "wagmi";

import { useStore } from "../../hooks/useStore";
import { NetworkConfig } from "../../mud/utils";

export type Props = {
  networkConfig: NetworkConfig;
  children: React.ReactNode;
};

export function ExternalWalletProvider({ networkConfig, children }: Props) {
  const { data: externalWalletClient } = useWalletClient();
  const { loadingPageHidden } = useStore();
  // const { } = useEmbeddedWallet();
  // const { address, isConnected } = useAccount();
  useEffect(() => {
    if (networkConfig.useBurner) return;

    if (!externalWalletClient) {
      useStore.setState({
        externalWalletClient: null,
        externalWorldContract: null,
      });
      return;
    }

    const customExternalWalletClient = externalWalletClient.extend(
      transactionQueue()
    );

    // TODO: centralize this somewhere
    const publicClient = createPublicClient({
      chain: networkConfig.chain,
      transport: transportObserver(
        fallback([webSocket(), http()], { retryCount: 0 })
      ),
      pollingInterval: 250,
    });

    const externalWorldContract = getContract({
      address: networkConfig.worldAddress as Hex,
      abi: IWorldAbi,
      client: {
        public: publicClient,
        wallet: customExternalWalletClient,
      },
    });

    useStore.setState({
      externalWalletClient: customExternalWalletClient,
      externalWorldContract,
    });
  }, [
    externalWalletClient,
    networkConfig.chain,
    networkConfig.useBurner,
    networkConfig.worldAddress,
    loadingPageHidden,
  ]);

  return children;
}
