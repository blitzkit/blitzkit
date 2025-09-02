import { Button, Flex, Heading } from "@radix-ui/themes";
import { awaitableEquipmentDefinitions } from "../../../../core/awaitables/equipmentDefinitions";
import { useLocale } from "../../../../hooks/useLocale";
import { Duel } from "../../../../stores/duel";
import { EquipmentManager } from "../../../EquipmentManager";
import { ConfigurationChildWrapper } from "./ConfigurationChildWrapper";

const equipmentDefinitions = await awaitableEquipmentDefinitions;

export function Equipment() {
  const protagonist = Duel.use((state) => state.protagonist);
  const equipmentPreset =
    equipmentDefinitions.presets[protagonist.tank.equipment_preset];
  const equipmentMatrix = Duel.use(
    (state) => state.protagonist.equipmentMatrix
  );
  const { strings } = useLocale();

  return (
    <ConfigurationChildWrapper>
      <Flex gap="4" align="center">
        <Heading size="4">
          {strings.website.tools.tankopedia.configuration.equipment.title}
        </Heading>
        <Button
          variant="ghost"
          color="red"
          onClick={() => {
            Duel.mutate((draft) => {
              draft.protagonist.equipmentMatrix.forEach((row) => {
                row.forEach((_, index) => {
                  row[index] = 0;
                });
              });
            });
          }}
        >
          {strings.website.tools.tankopedia.configuration.equipment.clear}
        </Button>
      </Flex>

      <EquipmentManager
        matrix={equipmentMatrix}
        preset={equipmentPreset}
        onChange={(matrix) => {
          Duel.mutate((draft) => {
            draft.protagonist.equipmentMatrix = matrix;
          });
        }}
      />
    </ConfigurationChildWrapper>
  );
}
