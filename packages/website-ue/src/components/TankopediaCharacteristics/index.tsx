import { CaretDownIcon, CaretRightIcon } from "@radix-ui/react-icons";
import { useCharacteristicRenderer } from "../../hooks/useCharacteristicRenderer";
import { useStrings } from "../../hooks/useStrings";
import { Tankopedia } from "../../stores/tankopedia";
import type { CharacteristicOutput } from "../../tankopedia/characteristics";
import {
  characteristicsOrder,
  type CharacteristicRenderConfig,
  type CharacteristicsGroup,
} from "../../tankopedia/characteristicsOrder";
import type { ComputedCharacteristics } from "../../tankopedia/computeCharacteristics";
import { Heading } from "../Heading";
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
  const isOpen = Tankopedia.use((state) => state.groups[group.group]);
  const strings = useStrings();

  return (
    <div className={styles.group}>
      <div className={styles["title-wrapper"]}>
        <Heading className={styles.title} size="3">
          <div className={styles["title-content"]}>
            {isOpen ? <CaretDownIcon /> : <CaretRightIcon />}
            {
              (strings.tanks.characteristics.titles as Record<string, string>)[
                group.group
              ]
            }
          </div>
        </Heading>

        <div className={styles.separator} />
      </div>

      <div className={styles.content}>
        {group.order.map((item) =>
          "toy" in item ? (
            <Toy {...item} />
          ) : (
            <Item config={item} value={characteristics[item.name]} />
          ),
        )}
      </div>
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
        <Text lowContrast>
          {
            (strings.tanks.characteristics.items as Record<string, string>)[
              config.name
            ]
          }
        </Text>
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
  return <span className={styles.toy}></span>;
}
