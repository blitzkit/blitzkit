import { CaretDownIcon, CaretRightIcon } from "@radix-ui/react-icons";
import { useStrings } from "../../hooks/useStrings";
import { Tankopedia } from "../../stores/tankopedia";
import {
  characteristicsOrder,
  type CharacteristicRenderConfig,
  type CharacteristicsGroup,
} from "../../tankopedia/characteristicsOrder";
import { Heading } from "../Heading";
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
            {strings.tanks.characteristics.titles[group]}
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

function Toy({ toy }: ToyProps) {
  return <span className={styles.toy}></span>;
}

function Item({ name }: CharacteristicRenderConfig) {
  return <span className={styles.item}></span>;
}
