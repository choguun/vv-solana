import { Modal } from "../Modal";
import { Button } from "../Theme/SkyStrife/Button";

interface QuestModalProps {
  setOpen: (open: boolean) => void;
  isOpen: boolean;
}

enum QuestTypes {
  DAILY_CHECK_IN = 0,
  DAILY_LOG_IN = 1,
  GATHER_RESOURCE = 2,
  COMMON_RESOURCE = 3,
  RARE_RESOURCE = 4,
  MYSTICAL_RESOURCE = 5,
  ARTIFACT_RESOURCE = 6,
  GOD_RESOURCE = 7,
}

export function QuestModal({ setOpen, isOpen }: QuestModalProps) {


  const handleClaim = async (type: QuestTypes) => {
    console.log("handleClaim");
  };

  return (
    <Modal isOpen={isOpen} setOpen={setOpen} title="quests">
      <div className="mb-5">
        <div className="px-10 py-4 border-2 border-black border-solid rounded-md inline-block w-full">
          <span className="text-xl">
            Daily Check-in 1/1
          </span>
          <div className="float-right">
            <span className="text-xl font-black mr-5 text-green-700">
              100 $COIN
            </span>
            <Button
              buttonType="secondary"
              disabled={
                true
              }
              onClick={() => handleClaim(QuestTypes.DAILY_CHECK_IN)}
            >
              {false ? "CLAIMED" : "CLAIM"}
            </Button>
          </div>
        </div>
        <div className="px-10 py-4 border-2 border-black border-solid rounded-md inline-block w-full mt-2">
          <span className="text-xl">
            Gather Resource 0/100
          </span>
          <div className="float-right">
            <span className="text-xl font-black mr-5 text-green-700">
              1,000 $COIN
            </span>
            <Button
              buttonType="secondary"
              className="float-right"
              disabled={true}
              onClick={() => handleClaim(QuestTypes.GATHER_RESOURCE)}
            >
              CLAIM
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
