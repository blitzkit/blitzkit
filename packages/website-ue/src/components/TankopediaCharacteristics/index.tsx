import { CaretDownIcon, CaretRightIcon } from "@radix-ui/react-icons";
import {
  characteristicsOrder,
  type CharacteristicRenderConfig,
  type CharacteristicsGroup,
} from "../../tankopedia/characteristicsOrder";
import styles from "./index.module.css";
import { Heading } from "../Heading";
import { Tankopedia, TankopediaTab } from "../../stores/tankopedia";
import { useStrings } from "../../hooks/useStrings";

export function TankopediaCharacteristics() {
  const isVisible = Tankopedia.use(
    (state) => state.tab === TankopediaTab.Characteristics,
  );

  return (
    <div className={styles.characteristics} data-visible={isVisible}>
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
  return <span>{toy}</span>;
}

function Item({ name }: CharacteristicRenderConfig) {
  return <span>{name}</span>;
}
