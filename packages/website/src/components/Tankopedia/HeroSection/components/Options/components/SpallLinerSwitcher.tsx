import { asset, availableProvisions } from "@blitzkit/core";
import { Flex, IconButton, Popover, Text } from "@radix-ui/themes";
import { awaitableProvisionDefinitions } from "../../../../../../core/awaitables/provisionDefinitions";
import { SPALL_LINER_PROVISION_ID } from "../../../../../../core/blitzkit/spallLiner";
import { useLocale } from "../../../../../../hooks/useLocale";
import { Duel } from "../../../../../../stores/duel";
import { Tankopedia } from "../../../../../../stores/tankopedia";
import { ProvisionButton } from "../../../../../ModuleButtons/ProvisionButton";

const provisionDefinitions = await awaitableProvisionDefinitions;

export function SpallLinerSwitcher() {
  const { tank, gun, provisions } = Duel.use((state) => state.protagonist);
  const { strings, unwrap } = useLocale();
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
        src={asset(`icons/provisions/${SPALL_LINER_PROVISION_ID}.webp`)}
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
        <Flex direction="column" gap="2" maxWidth="240px">
          <Text size="2" color="gray">
            {strings.website.tools.tankopedia.sandbox.spall_liner.swap_prompt}
          </Text>

          <Flex gap="2" wrap="wrap">
            {provisions.map((id) => (
              <Popover.Close key={id}>
                <ProvisionButton
                  provision={id}
                  selected={false}
                  onClick={() => equip(id)}
                />
              </Popover.Close>
            ))}
          </Flex>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
}
