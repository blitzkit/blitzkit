import { useCharacteristicRenderer } from "../../hooks/useCharacteristicRenderer";
import { useStrings } from "../../hooks/useStrings";
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
    <div className={styles["characteristics-wrapper"]}>
      <div className={styles.characteristics}>
        {characteristicsOrder.map((group) => (
          <Group group={group} characteristics={characteristics} />
        ))}
      </div>
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
  const items = group.order.filter(
    (item) => "name" in item && characteristics[item.name] !== null,
  ).length;
  const groupSpan = `calc(${toys} * var(--group-span) + ${items} + 2)`;
  const contentSpan = `calc(${toys} * var(--group-span) + ${items})`;

  return (
    <div
      className={styles.group}
      style={{
        gridRow: `span ${groupSpan}`,
        gridTemplateRows: `repeat(${groupSpan}, 1fr)`,
      }}
    >
      <div className={styles.title}>
        <div className={styles.center}>
          <Heading size="3" className={styles.text}>
            <div className={styles.align}>
              {
                (
                  strings.tanks.characteristics.titles as Record<string, string>
                )[group.group]
              }
              <img src={`/media/groups/${group.group}.png`} />
            </div>
          </Heading>
        </div>
      </div>

      <div
        className={styles.content}
        style={{
          gridRow: `span ${contentSpan}`,
        }}
      >
        {group.order.map((item) => (
          <>
            {"toy" in item && <Toy {...item} />}
            {"name" in item && characteristics[item.name] !== null && (
              <Item config={item} value={characteristics[item.name]} />
            )}
          </>
        ))}

        <div className={styles.dead} />
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
        <Bar value={0.5} />

        <Text lowContrast size="minor" className={styles.number}>
          1 / 132
        </Text>
      </div>
    </span>
  );
}

interface BarProps {
  value: number;
}

const barColors = ["red", "orange", "amber", "jade"];

function Bar({ value }: BarProps) {
  const index = (barColors.length - 1) * value;
  const iA = Math.floor(index);
  const iB = Math.ceil(index);
  const A = barColors[iA];
  const B = barColors[iB];
  const x = index % 1;
  const p = (1 - x) * 100;
  const v = 7;

  return (
    <div className={styles["bar-wrapper"]}>
      <div
        className={styles.bar}
        style={{
          backgroundColor: `color-mix(in srgb, var(--${A}-${v}) ${p}%, var(--${B}-${v}))`,
          width: `${value * 100}%`,
        }}
      />
    </div>
  );
}

interface ToyProps {
  toy: string;
}

function Toy({ toy }: ToyProps) {
  return (
    <div className={styles.toy}>
      <div className={styles.sandbox}>
        <Text lowContrast>{toy} toy</Text>
      </div>
    </div>
  );
}
