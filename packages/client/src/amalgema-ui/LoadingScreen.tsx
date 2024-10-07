/* eslint-disable no-empty-pattern */
import React, { useEffect, useMemo, useState } from "react";

import { getComponentValue } from "@latticexyz/recs";
import { SyncStep } from "@latticexyz/store-sync";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { filterNullish } from "@latticexyz/utils";
import { concat, map } from "rxjs";

import { useObservableValue } from "../hooks/useObservableValue";
import { useStore } from "../hooks/useStore";
import { NetworkLayer } from "../layers/Network";
import { DISCORD_URL, HOW_TO_PLAY_URL, MUD_URL } from "../links";

import { CustomConnectButton } from "./CustomConnectButton";
import { Button } from "./Theme/SkyStrife/Button";
import { Card } from "./Theme/SkyStrife/Card";
import { Body, Caption, Link } from "./Theme/SkyStrife/Typography";

type Props = {
  networkLayer: NetworkLayer | null;
  usePrepTime?: boolean;
};

export const LoadingScreen = ({ networkLayer, usePrepTime }: Props) => {
  const { loadingPageHidden: hide } = useStore();
  const setHide = (h: boolean) => {
    useStore.setState({ loadingPageHidden: h });
  };

  const [prepareGameProgress, setPrepareGameProgress] = useState(0);
  const [startGameProgress, setStartGameProgress] = useState(false);

  const loadingState = useObservableValue(
    useMemo(() => {
      if (!networkLayer) return;
      const {
        components: { SyncProgress },
        network: {},
      } = networkLayer;
      // use LoadingState.update$ as a trigger rather than a value
      // and concat with an initial value to trigger the first look up
      return concat([1], SyncProgress.update$).pipe(
        map(() => {
          const loadingState = getComponentValue(SyncProgress, singletonEntity);
          return loadingState ?? null;
        }),
        filterNullish()
      );
    }, [networkLayer]),
    {
      message: "Connecting",
      percentage: 0,
      step: SyncStep.INITIALIZE,
      lastBlockNumberProcessed: 40220522n,
      latestBlockNumber: 40220522n,
    }
  );

  const [worldValid, setWorldValid] = useState(true);
  useEffect(() => {
    if (!networkLayer) return;
    if (loadingState.step !== SyncStep.LIVE) return;

    if (!usePrepTime || prepareGameProgress === 100) {
      const {
        components: { SeasonConfig },
      } = networkLayer;

      // check if there is a value for a table that is only available after the game is ready
      // SkyPoolConfig is set in the PostDeploy script
      // if it does not exist something is wrong
      const seasonConfig = getComponentValue(SeasonConfig, singletonEntity);
      setWorldValid(!!seasonConfig);
    }
  }, [loadingState.step, networkLayer, prepareGameProgress, usePrepTime]);

  useEffect(() => {
    if (!usePrepTime) return;
    if (!networkLayer) return;
    if (loadingState.step !== SyncStep.LIVE) return;

    setStartGameProgress(true);
  }, [loadingState, networkLayer, prepareGameProgress, usePrepTime]);

  const prepTimeSeconds = import.meta.env.PROD ? 1 : 1;
  useEffect(() => {
    if (!startGameProgress) return;

    const interval = setInterval(() => {
      setPrepareGameProgress((prev) => {
        if (prev === 100) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, (prepTimeSeconds * 1000) / 100);

    return () => clearInterval(interval);
  }, [networkLayer, prepTimeSeconds, startGameProgress, usePrepTime]);

  const doneLoading = usePrepTime
    ? prepareGameProgress === 100
    : loadingState.step === SyncStep.LIVE;
  useEffect(() => {
    if (doneLoading && worldValid) setHide(true);
  }, [doneLoading, worldValid]);

  const showPrepMessage = loadingState.step === SyncStep.LIVE && usePrepTime;

  const loadingMessage = showPrepMessage
    ? "Preparing Game"
    : loadingState.message;
  const loadingPercentage = showPrepMessage
    ? prepareGameProgress
    : Math.round(loadingState.percentage);
  const showPercentage = showPrepMessage || loadingPercentage > 0;

  if (hide) {
    return null;
  }

  return (
    <div
      style={{
        zIndex: 99999,
        background:
          "linear-gradient(rgba(24, 23, 16, 0.4), rgba(24, 23, 16, 0.4)), url(assets/ss-splash-min.png)",
        backgroundPosition: "right",
        backgroundSize: "cover",
      }}
      className="fixed items-center justify-center w-screen h-screen bg-black p-12 flex flex-col pointer-events-none z-100"
    >
      <Card primary className="flex flex-col w-[540px] p-8 justify-items">
        {!doneLoading && (
          <div className="flex flex-col grow items-center mt-4 text-center">
            <Body>
              VoxelWorld is Fully on-chain autonomous sandbox game. Player can
              Quest, Craft, Interact AI, and DeFi to win the prize pool.
            </Body>
            {/* <CustomConnectButton /> */}
            <div className="h-4"></div>

            {/* <a
              className="w-full"
              href={HOW_TO_PLAY_URL}
              target="_blank"
              rel="noreferrer"
            >
              <Button buttonType="tertiary" size="lg" className="w-full">
                How To Play
              </Button>
            </a> */}
          </div>
        )}

        {doneLoading && worldValid && (
          <div className="flex flex-col grow pointer-events-auto">
            <Body className="px-4 mt-4 text-center text-sm font-thin">
              By clicking &apos;I agree&apos;, you acknowledge that you (i)
              agree to the{" "}
              <Link className="" href={"/terms.pdf"}>
                Terms of Service
              </Link>{" "}
              and (ii) have read and understood our{" "}
              <Link href={"/privacy-policy"}>Privacy Policy</Link>.
            </Body>

            <div className="h-3" />

            <Button
              buttonType="primary"
              size="lg"
              onClick={() => {
                setHide(true);
              }}
              className="w-full"
            >
              I agree
            </Button>
          </div>
        )}

        {doneLoading && !worldValid && (
          <div className="flex flex-row w-full mt-8 justify-center items-center">
            <img height="55px" width="55px" src="./assets/loading.webp" />
            <div className="w-4"></div>
            <Body className="text-center text-3xl text-ss-text-default">
              {import.meta.env.DEV
                ? "The connected VoxelWorld world is not valid. This usually means contract deployment is ongoing or failed. Check your console for more information."
                : "Something went wrong. Please report this issue on Discord."}
            </Body>
            <div className="w-4"></div>
            <img height="55px" width="55px" src="./assets/loading.webp" />
          </div>
        )}

        {!doneLoading && (
          <div className="flex flex-row w-full mt-8 justify-center items-center">
            <img height="32px" width="32px" src="./assets/loading.webp" />
            <div className="w-4"></div>
            <Body className="text-center text-3xl text-ss-text-default">
              {loadingMessage}
              {showPercentage && (
                <div className="text-ss-blue">({loadingPercentage}%)</div>
              )}
            </Body>
            <div className="w-4"></div>
            <img height="32px" width="32px" src="./assets/loading.webp" />
          </div>
        )}
      </Card>

      <div className="stretch"></div>

      <div className="flex justify-between stretch">
        <div className="absolute bottom-6 left-6 flex justify-between">
          {/* <Link className="text-ss-gold" href={LATTICE_URL}>
            lattice.xyz
          </Link>

          <div className="w-6 text-center text-ss-divider-stroke">|</div> */}

          <Link className="text-ss-gold" href={DISCORD_URL}>
            join discord
          </Link>

          <div className="w-6 text-center text-ss-divider-stroke">|</div>

          <Link className="text-ss-gold" href={HOW_TO_PLAY_URL}>
            getting started
          </Link>

          {/* <div className="w-6 text-center text-ss-divider-stroke">|</div>

          <Link className="text-ss-gold" href={"/privacy-policy"}>
            privacy policy
          </Link>

          <div className="w-6 text-center text-ss-divider-stroke">|</div>

          <Link className="text-ss-gold" href={"/terms.pdf"}>
            terms of service
          </Link> */}
        </div>

        <Caption className="absolute bottom-6 right-6 ml-4 text-neutral-300">
          powered by{" "}
          <Link className="text-ss-gold" href={MUD_URL}>
            Voxelverses
          </Link>
        </Caption>
      </div>
    </div>
  );
};
