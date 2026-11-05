import type { EquipmentPreset } from "@blitzkit/protos";
import { Flex } from "@radix-ui/themes";
import { chunk, cloneDeep } from "lodash-es";
import type { EquipmentMatrix } from "../../stores/duel";
import { EquipmentButton } from "../ModuleButtons/EquipmentButton";
import "./index.css";

interface EquipmentManagerProps {
  preset: EquipmentPreset;
  matrix: EquipmentMatrix;
  onChange: (matrix: EquipmentMatrix) => void;
}

export function EquipmentManager({
  preset,
  matrix,
  onChange,
}: EquipmentManagerProps) {
  return (
    <Flex direction="column" gap="2" className="equipment-manager">
      {chunk(preset.slots, 3).map((equipmentRow, rowIndex) => (
        <Flex gap="2" key={rowIndex}>
          {equipmentRow.map((equipment, columnIndex) => (
            <Flex key={columnIndex}>
              <EquipmentButton
                className="left"
                equipment={equipment.left}
                selected={matrix[rowIndex][columnIndex] === -1}
                onClick={() => {
                  const draft = cloneDeep(matrix);

                  if (draft[rowIndex][columnIndex] === -1) {
                    draft[rowIndex][columnIndex] = 0;
                  } else {
                    draft[rowIndex][columnIndex] = -1;
                  }

                  onChange(draft);
                }}
              />
              <EquipmentButton
                className="right"
                equipment={equipment.right}
                selected={matrix[rowIndex][columnIndex] === 1}
                onClick={() => {
                  const draft = cloneDeep(matrix);

                  if (draft[rowIndex][columnIndex] === 1) {
                    draft[rowIndex][columnIndex] = 0;
                  } else {
                    draft[rowIndex][columnIndex] = 1;
                  }

                  onChange(draft);
                }}
              />
            </Flex>
          ))}
        </Flex>
      ))}
    </Flex>
  );
}
