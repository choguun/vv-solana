/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";

import { Header } from "./Header";
import { Button } from "./Theme/SkyStrife/Button";

import { CharacterModal } from "./CharacterModal";
import { CharacterPlayerSection } from "./CharacterPlayerSection";

import { QuestModal } from "./QuestModal";

export const UIRoot = () => {
  const [openCharacterModal, setOpenCharacterModal] = useState(false);
  const [openQuestModal, setOpenQuestModal] = useState(false);

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
            <Button
              buttonType="primary"
              className="ml-3"
              onClick={() => setOpenQuestModal(true)}
            >
              Quests
            </Button>
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
