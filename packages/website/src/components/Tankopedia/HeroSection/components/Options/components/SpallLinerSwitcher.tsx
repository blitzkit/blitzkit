import { alias, availableProvisions } from "@blitzkit/core";
import { ShuffleIcon } from "@radix-ui/react-icons";
import { Flex, IconButton, Popover } from "@radix-ui/themes";
import { api } from "../../../../../../core/blitzkit/api";
import { SPALL_LINER_PROVISION_ID } from "../../../../../../core/blitzkit/spallLiner";
import { useLocale } from "../../../../../../hooks/useLocale";
import { Duel } from "../../../../../../stores/duel";
import { Tankopedia } from "../../../../../../stores/tankopedia";

const provisionDefinitions = await api.provisionDefinitions();

export function SpallLinerSwitcher() {
  const { tank, gun, provisions } = Duel.use((state) => state.protagonist);
  const { unwrap } = useLocale();
  const isSpallLinerActive = provisions.includes(SPALL_LINER_PROVISION_ID);
  const hasSlotAvailable = provisions.length < tank.max_provisions;

  const canEquipSpallLiner = availableProvisions(
    tank,
    gun,
    provisionDefinitions,
  ).some((provision) => provision.id === SPALL_LINER_PROVISION_ID);

  if (!canEquipSpallLiner) return null;

  function equip(replacing?: number) {
    Duel.mutate((draft) => {
      if (replacing !== undefined) {
        const provisions = draft.protagonist.provisions;
        provisions[provisions.indexOf(replacing)] = SPALL_LINER_PROVISION_ID;
      } else {
        draft.protagonist.provisions.push(SPALL_LINER_PROVISION_ID);
      }
    });
    Tankopedia.mutate((draft) => {
      draft.shot = undefined;
    });
  }

  function unequip() {
    Duel.mutate((draft) => {
      draft.protagonist.provisions = draft.protagonist.provisions.filter(
        (id) => id !== SPALL_LINER_PROVISION_ID,
      );
    });
    Tankopedia.mutate((draft) => {
      draft.shot = undefined;
    });
  }

  const button = (
    <IconButton
      color={isSpallLinerActive ? undefined : "gray"}
      variant="soft"
      size={{ initial: "2", sm: "3" }}
      radius="none"
      onClick={() => {
        if (isSpallLinerActive) {
          unequip();
        } else if (hasSlotAvailable) {
          equip();
        }
      }}
    >
      <img
        alt={unwrap(provisionDefinitions.provisions[SPALL_LINER_PROVISION_ID].name!)}
        src={alias("api", `/icons/provisions/${SPALL_LINER_PROVISION_ID}.webp`)}
        style={{
          width: "50%",
          height: "50%",
        }}
      />
    </IconButton>
  );

  if (isSpallLinerActive || hasSlotAvailable) return button;

  return (
    <Popover.Root>
      <Popover.Trigger>{button}</Popover.Trigger>

      <Popover.Content>
        <Flex gap="2" align="center">
          <IconButton color="gray" variant="soft" size="3" radius="none" disabled>
            <img
              alt={unwrap(
                provisionDefinitions.provisions[SPALL_LINER_PROVISION_ID].name!,
              )}
              src={alias(
                "api",
                `/icons/provisions/${SPALL_LINER_PROVISION_ID}.webp`,
              )}
              style={{
                width: "50%",
                height: "50%",
              }}
            />
          </IconButton>

          <ShuffleIcon color="var(--gray-9)" />

          <Flex gap="2">
            {provisions.map((id) => (
              <Popover.Close key={id}>
                <IconButton
                  color="gray"
                  variant="soft"
                  size="3"
                  radius="none"
                  onClick={() => equip(id)}
                >
                  <img
                    alt={unwrap(provisionDefinitions.provisions[id].name!)}
                    src={alias("api", `/icons/provisions/${id}.webp`)}
                    style={{
                      width: "50%",
                      height: "50%",
                    }}
                  />
                </IconButton>
              </Popover.Close>
            ))}
          </Flex>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
}
