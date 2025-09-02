import { checkConsumableProvisionInclusivity } from "@blitzkit/core/src/blitzkit/checkConsumableProvisionInclusivity";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  Button,
  Flex,
  Heading,
  IconButton,
  Popover,
  Text,
} from "@radix-ui/themes";
import { awaitableConsumableDefinitions } from "../../../../core/awaitables/consumableDefinitions";
import { useEquipment } from "../../../../hooks/useEquipment";
import { useLocale } from "../../../../hooks/useLocale";
import { Duel } from "../../../../stores/duel";
import { ConsumablesManager } from "../../../ConsumablesManager";
import { ConfigurationChildWrapper } from "./ConfigurationChildWrapper";

const consumableDefinitions = await awaitableConsumableDefinitions;

export function Consumables() {
  const protagonist = Duel.use((state) => state.protagonist);
  const consumables = Duel.use((state) => state.protagonist.consumables);
  const consumablesList = Object.values(
    consumableDefinitions.consumables
  ).filter((consumable) =>
    checkConsumableProvisionInclusivity(
      consumable,
      protagonist.tank,
      protagonist.gun
    )
  );
  const cooldownBooster = Duel.use(
    (state) => state.protagonist.cooldownBooster
  );
  const hasConsumableDeliverySystem = useEquipment(118);
  const hasHighEndConsumables = useEquipment(101);
  const { strings } = useLocale();

  return (
    <ConfigurationChildWrapper>
      <Flex gap="4" align="center">
        <Flex gap="2" align="center">
          <Heading size="4">
            {strings.website.tools.tankopedia.configuration.consumables.title}
          </Heading>

          <Popover.Root>
            <Popover.Trigger>
              <IconButton variant="ghost">
                <InfoCircledIcon />
              </IconButton>
            </Popover.Trigger>

            <Popover.Content>
              <Text>
                {
                  strings.website.tools.tankopedia.configuration.consumables
                    .info
                }
              </Text>
            </Popover.Content>
          </Popover.Root>
        </Flex>

        <Button
          variant="ghost"
          color="red"
          onClick={() => {
            Duel.mutate((draft) => {
              draft.protagonist.consumables = [];
            });
          }}
        >
          {strings.website.tools.tankopedia.configuration.consumables.clear}
        </Button>
      </Flex>

      <ConsumablesManager
        consumables={consumablesList}
        selected={consumables}
        cooldownBooster={cooldownBooster}
        disabled={protagonist.tank.max_consumables === consumables.length}
        hasConsumableDeliverySystem={hasConsumableDeliverySystem}
        hasHighEndConsumables={hasHighEndConsumables}
        timers
        onConsumablesChange={(consumables) => {
          Duel.mutate((draft) => {
            draft.protagonist.consumables = consumables;
          });
        }}
        justify={{ initial: "center", sm: "start" }}
      />
    </ConfigurationChildWrapper>
  );
}
