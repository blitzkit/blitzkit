import { useCharacteristicRenderer } from "../../hooks/useCharacteristicRenderer";
import type {
  CharacteristicRenderConfig,
  CharacteristicReturnType,
} from "../../types/characteristics";
import { Text } from "../Text";
import styles from "./index.module.css";

interface CharacteristicValueProps {
  config: CharacteristicRenderConfig;
  value: CharacteristicReturnType;
  units?: boolean;
}

export function CharacteristicValue({
  config,
  value,
  units = true,
}: CharacteristicValueProps) {
  const renderCharacteristic = useCharacteristicRenderer(units);
  const hasUnits = units && config.units !== undefined;

  return (
    <Text
      className={styles.value}
      lowContrast={hasUnits}
      size={hasUnits ? "minor" : undefined}
    >
      {renderCharacteristic(value, config)}
    </Text>
  );
}
