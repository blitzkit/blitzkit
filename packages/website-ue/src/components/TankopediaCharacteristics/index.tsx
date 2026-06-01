import { GearIcon } from "@radix-ui/react-icons";
import { useCharacteristicRenderer } from "../../hooks/useCharacteristicRenderer";
import { useStrings } from "../../hooks/useStrings";
import type { CharacteristicOutput } from "../../tankopedia/characteristics";
import {
  characteristicsOrder,
  type CharacteristicRenderConfig,
  type CharacteristicsGroup,
} from "../../tankopedia/characteristicsOrder";
import type { ComputedCharacteristics } from "../../tankopedia/computeCharacteristics";
import { Text } from "../Text";
import styles from "./index.module.css";

interface TankopediaCharacteristicsProps {
  characteristics: ComputedCharacteristics;
}

export function TankopediaCharacteristics({
  characteristics,
}: TankopediaCharacteristicsProps) {
  return (
    <div className={styles.characteristics}>
      {characteristicsOrder.map((group) => (
        <Group group={group} characteristics={characteristics} />
      ))}
    </div>
  );
}

interface GroupProps {
  group: CharacteristicsGroup;
  characteristics: ComputedCharacteristics;
}

function Group({ group, characteristics }: GroupProps) {
  const strings = useStrings();
  const toys = group.order.filter((item) => "toy" in item).length;
  const items = group.order.filter((item) => "name" in item).length;
  const span = `calc(${toys} * var(--group-span) + ${items} + 1)`;

  return (
    <div
      className={styles.group}
      style={{
        gridRow: `span ${span}`,
        gridTemplateRows: `repeat(${span}, 1fr)`,
      }}
    >
      <div className={styles["title-wrapper"]}>
        <Text className={styles.title}>
          <div className={styles.content}>
            {group.group}
            <GearIcon />
          </div>
        </Text>
      </div>

      {group.order.map((item) =>
        "toy" in item ? (
          <Toy {...item} />
        ) : (
          <Item config={item} value={characteristics[item.name]} />
        ),
      )}
    </div>
  );
}

interface ItemProps {
  config: CharacteristicRenderConfig;
  value: CharacteristicOutput;
}

function Item({ config, value }: ItemProps) {
  const strings = useStrings();
  const renderCharacteristic = useCharacteristicRenderer();

  return (
    <span className={styles.item}>
      <div className={styles.value}>
        <Text lowContrast>{config.name}</Text>
        <Text>{renderCharacteristic(value, config)}</Text>
      </div>

      <div className={styles.ranking}>
        <div className={styles["bar-wrapper"]}>
          <div className={styles.bar} />
        </div>

        <Text lowContrast size="minor" className={styles.number}>
          1 / 132
        </Text>
      </div>
    </span>
  );
}

interface ToyProps {
  toy: string;
}

function Toy({ toy }: ToyProps) {
  return (
    <div className={styles.toy}>
      <div className={styles.content}>
        <Text lowContrast>{toy} toy</Text>
      </div>
    </div>
  );
}
