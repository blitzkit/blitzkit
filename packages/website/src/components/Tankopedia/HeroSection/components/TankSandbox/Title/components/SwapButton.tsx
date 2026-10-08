import { UpdateIcon } from "@radix-ui/react-icons";
import { Button, Dialog } from "@radix-ui/themes";
import { useState } from "react";
import { api } from "../../../../../../../core/blitzkit/api";
import { tankToDuelMember } from "../../../../../../../core/blitzkit/tankToDuelMember";
import { useLocale } from "../../../../../../../hooks/useLocale";
import { Duel } from "../../../../../../../stores/duel";
import { Tankopedia } from "../../../../../../../stores/tankopedia";
import { TankSearch } from "../../../../../../TankSearch";

const [modelDefinitions, provisionDefinitions] = await Promise.all([
  api.modelDefinitions(),
  api.provisionDefinitions(),
]);

function showTank(tankId: number) {
  Tankopedia.mutate((draft) => {
    draft.model = modelDefinitions.models[tankId];
    draft.revealed = false;
    draft.shot = undefined;
    draft.highlightArmor = undefined;
  });
}

export function SwapButton() {
  const [open, setOpen] = useState(false);
  const { strings } = useLocale();

  return (
    <>
      <Button
        size="1"
        variant="surface"
        color="gray"
        highContrast
        style={{ pointerEvents: "auto" }}
        onClick={() => {
          const { protagonist, antagonist } = Duel.state;

          if (protagonist.tank.id === antagonist.tank.id) {
            setOpen(true);
            return;
          }

          Duel.mutate((draft) => {
            draft.protagonist = antagonist;
            draft.antagonist = protagonist;
          });
          showTank(antagonist.tank.id);
        }}
      >
        <UpdateIcon />
        {strings.website.tools.tankopedia.meta.swap.button}
      </Button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Content>
          <Dialog.Title align="center">
            {strings.website.tools.tankopedia.meta.swap.title}
          </Dialog.Title>

          <TankSearch
            compact
            onSelect={(tank) => {
              Duel.mutate((draft) => {
                draft.protagonist = tankToDuelMember(
                  tank,
                  provisionDefinitions,
                );
              });
              showTank(tank.id);
              setOpen(false);
            }}
          />
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
