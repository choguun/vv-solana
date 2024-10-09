/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";

import { Header } from "./Header";
import { Button } from "./Theme/SkyStrife/Button";

import { CharacterModal } from "./CharacterModal";
import { CharacterPlayerSection } from "./CharacterPlayerSection";

import { QuestModal } from "./QuestModal";

import { useAnchor } from "../containers/Providers/Anchor";

export const UIRoot = () => {
  const { dailyCheckIn, fetchPlayerPoint, program } = useAnchor();

  const [openCharacterModal, setOpenCharacterModal] = useState(false);
  const [openQuestModal, setOpenQuestModal] = useState(false);
  const [points, setPoints] = useState(0);

  const handleDailyCheckIn = async () => {
    console.log("handleDailyCheckIn");
    await dailyCheckIn();
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  const doFetchPlayerPoint = async () => {
    console.log("doFetchPlayerPoint");
    const data = await fetchPlayerPoint();
    setPoints(data);
    console.log(data);
  }

  useEffect(() => {
    doFetchPlayerPoint();
  }, [program]);

  return (
    <div className="flex h-screen">
      <div className="h-screen flex flex-col grow">
        <Header />
        <div
          style={{
            background:
              "linear-gradient(152deg, rgba(244, 243, 241, 0.98) 0%, rgba(244, 243, 241, 0.88) 100%), lightgray -381.491px 0.145px / 126.42% 100% no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "right",
            zIndex: -2,
          }}
          className="fixed top-0 left-0 h-screen w-screen bg-cover"
        />
        <div className="grow px-8 py-6 flex flex-col">
          <div className="h-6" />
          <div>
            <span className="text-3xl font-black">Points: {points}</span>
            <Button
              buttonType="secondary"
              className="ml-3"
              onClick={() => handleDailyCheckIn()}
            >
              Daily Check-in
            </Button>
            <Button
              buttonType="primary"
              className="ml-3"
              onClick={() => setOpenQuestModal(true)}
            >
              Quests
            </Button>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black">$COIN: 0</span>
          </div>
          <CharacterPlayerSection
            setOpenCharacterModal={setOpenCharacterModal}
          />
        </div>
      </div>
      <CharacterModal
        setOpen={setOpenCharacterModal}
        isOpen={openCharacterModal}
      />
      <QuestModal setOpen={setOpenQuestModal} isOpen={openQuestModal} />
    </div>
  );
};
