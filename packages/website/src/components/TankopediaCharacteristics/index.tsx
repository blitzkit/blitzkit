import { romanize } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n/src/literals";
import { useRef } from "react";
import { characteristicsGroups } from "../../config/characteristicsGroups";
import { toys } from "../../config/toys";
import { useCharacteristicRenderer } from "../../hooks/useCharacteristicRenderer";
import { DuelModule, useDuel } from "../../hooks/useDuel";
import { useRankings } from "../../hooks/useRankings";
import { useStrings } from "../../hooks/useStrings";
import { Tankopedia, TankopediaRelativeAgainst } from "../../stores/tankopedia";
import type { CharacteristicRank } from "../../tankopedia/calculateRankings";
import type {
  CharacteristicName,
  CharacteristicRenderConfig,
  CharacteristicReturnType,
  CharacteristicsGroup,
  ComputedCharacteristics,
  ToyName,
} from "../../types/characteristics";
import { Heading } from "../Heading";
import { SegmentedControl } from "../SegmentedControl";
import { Text } from "../Text";
import styles from "./index.module.css";

interface TankopediaCharacteristicsProps {
  characteristics: ComputedCharacteristics;
}

export function TankopediaCharacteristics({
  characteristics,
}: TankopediaCharacteristicsProps) {
  const rankings = useRankings(characteristics);

  return (
    <div className={styles["characteristics-wrapper"]}>
      <CompareOptions />

      <div className={styles.characteristics}>
        {characteristicsGroups.map((group) => {
          const items = group.order.filter(
            (item) => "name" in item && characteristics.has(item.name),
          ).length;
          const shouldRender = items > 0;

          if (!shouldRender) return null;

          return (
            <Group
              key={group.name}
              group={group}
              characteristics={characteristics}
              rankings={rankings}
            />
          );
        })}
      </div>
    </div>
  );
}

interface GroupProps {
  group: CharacteristicsGroup;
  characteristics: ComputedCharacteristics;
  rankings: Map<CharacteristicName, CharacteristicRank>;
}

function Group({ group, characteristics, rankings }: GroupProps) {
  const strings = useStrings();
  const toys = group.order.filter((item) => "toy" in item).length;
  const characteristicsCount = group.order.filter(
    (item) => "name" in item && characteristics.has(item.name),
  ).length;
  const labelsCount =
    characteristicsCount > 0
      ? group.order.filter((item) => "label" in item).length
      : 0;
  const items = characteristicsCount + labelsCount;
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
                )[group.name]
              }
              <img src={`/media/groups/${group.name}.png`} />
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
            {"toy" in item && (
              <ToyAssigner characteristics={characteristics} {...item} />
            )}
            {"label" in item && <Label {...item} />}
            {"name" in item && characteristics.has(item.name) && (
              <Item
                config={item}
                value={characteristics.get(item.name)!}
                ranking={rankings.get(item.name)}
              />
            )}
          </>
        ))}

        <div className={styles.dead} />
      </div>
    </div>
  );
}

interface LabelProps {
  label: string;
}

function Label({ label }: LabelProps) {
  const strings = useStrings();

  return (
    <div className={styles.label}>
      <Text lowContrast>
        {(strings.tanks.characteristics.items as Record<string, string>)[label]}
      </Text>
    </div>
  );
}

interface ItemProps {
  config: CharacteristicRenderConfig;
  value: CharacteristicReturnType;
  ranking?: CharacteristicRank;
}

function Item({ config, value, ranking }: ItemProps) {
  const strings = useStrings();
  const renderCharacteristic = useCharacteristicRenderer();
  const hasUnits = config.units !== undefined;

  return (
    <span className={styles.item} data-indent={config.indent}>
      <div className={styles.value}>
        <Text lowContrast>
          {
            (strings.tanks.characteristics.items as Record<string, string>)[
              config.name
            ]
          }
        </Text>

        <Text lowContrast={hasUnits} size={hasUnits ? "minor" : undefined}>
          <div className={styles.units}>
            {renderCharacteristic(value, config)}
          </div>
        </Text>
      </div>

      {ranking && (
        <div className={styles.ranking}>
          <Bar value={ranking.score} />

          <Text lowContrast size="minor" className={styles.number}>
            {literals(strings.units.fraction, {
              numerator: ranking.rank,
              denominator: ranking.total,
            })}
          </Text>
        </div>
      )}
    </span>
  );
}

function CompareOptions() {
  const tank = useDuel("protagonist", DuelModule.Tank);
  const relativeAgainst = Tankopedia.use((state) => state.relative_against);

  const strings = useStrings();

  const options = useRef([
    {
      value: `${TankopediaRelativeAgainst.ClassAndTier}`,
      relativeAgainst: TankopediaRelativeAgainst.ClassAndTier,
      label: literals(strings.tanks.characteristics.compare.class, {
        tier: romanize(tank.tier),
        class: strings.common.tank_class_short_plural_lowercase[tank.class],
      }),
    },
    {
      value: `${TankopediaRelativeAgainst.Tier}`,
      relativeAgainst: TankopediaRelativeAgainst.Tier,
      label: literals(strings.tanks.characteristics.compare.tier, {
        tier: romanize(tank.tier),
      }),
    },
    {
      value: `${TankopediaRelativeAgainst.All}`,
      relativeAgainst: TankopediaRelativeAgainst.All,
      label: strings.tanks.characteristics.compare.all,
    },
  ]);

  return (
    <div className={styles["compare-options"]}>
      <Text lowContrast>{strings.tanks.characteristics.compare.label}</Text>
      <SegmentedControl
        options={options.current}
        value={`${relativeAgainst}`}
        onValueChange={(value) => {
          Tankopedia.mutate((draft) => {
            draft.relative_against = Number(value);
          });
        }}
      />
    </div>
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

interface ToyAssignerProps {
  toy: ToyName;
  characteristics: ComputedCharacteristics;
}

function ToyAssigner({ toy, characteristics }: ToyAssignerProps) {
  const Toy = toys[toy];

  return (
    <div className={styles.toy}>
      <div className={styles.sandbox}>
        {Toy ? (
          <Toy characteristics={characteristics} />
        ) : (
          <Text lowContrast>{toy}</Text>
        )}
      </div>
    </div>
  );
}
