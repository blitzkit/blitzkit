import { CaretDownIcon, CaretRightIcon } from "@radix-ui/react-icons";
import { useStrings } from "../../hooks/useStrings";
import { Tankopedia } from "../../stores/tankopedia";
import {
  characteristicsOrder,
  type CharacteristicRenderConfig,
  type CharacteristicsGroup,
} from "../../tankopedia/characteristicsOrder";
import { Heading } from "../Heading";
import { Text } from "../Text";
import styles from "./index.module.css";

export function TankopediaCharacteristics() {
  return (
    <div className={styles.characteristics}>
      {characteristicsOrder.map((group) => (
        <Group {...group} />
      ))}
    </div>
  );
}

function Group({ group, order }: CharacteristicsGroup) {
  const isOpen = Tankopedia.use((state) => state.groups[group]);
  const strings = useStrings();

  return (
    <div className={styles.group}>
      <div className={styles["title-wrapper"]}>
        <Heading className={styles.title} size="3">
          <div className={styles["title-content"]}>
            {isOpen ? <CaretDownIcon /> : <CaretRightIcon />}
            {
              (strings.tanks.characteristics.titles as Record<string, string>)[
                group
              ]
            }
          </div>
        </Heading>

        <div className={styles.separator} />
      </div>

      <div className={styles.content}>
        {order.map((item) =>
          "toy" in item ? <Toy {...item} /> : <Item {...item} />,
        )}
      </div>
    </div>
  );
}

interface ToyProps {
  toy: string;
}

function Item({ name }: CharacteristicRenderConfig) {
  const strings = useStrings();

  return (
    <span className={styles.item}>
      <div className={styles.value}>
        <Text lowContrast>
          {
            (strings.tanks.characteristics.items as Record<string, string>)[
              name
            ]
          }
        </Text>
        <Text>123</Text>
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

function Toy({ toy }: ToyProps) {
  return <span className={styles.toy}></span>;
}
