import { romanize } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n/src/literals";
import { Fragment, useRef } from "react";
import { characteristicsGroups } from "../../config/characteristicsGroups";
import { RANKING_STEPS } from "../../config/rankings";
import { toys } from "../../config/toys";
import { withErrorWrapper } from "../../hocs/withErrorWrapper";
import { withLocale } from "../../hocs/withLocale";
import { useCharacteristics } from "../../hooks/useCharacteristics";
import { useDuelModules } from "../../hooks/useDuelModules";
import { useRankings } from "../../hooks/useRankings";
import { api } from "../../api/dynamic";
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
  ToyRenderConfig,
} from "../../types/characteristics";
import { Heading } from "../Heading";
import { SegmentedControl } from "../SegmentedControl";
import { CharacteristicValue } from "../CharacteristicValue";
import { Text } from "../Text";
import styles from "./index.module.css";

const tanks = await api.tanks();

interface TankopediaCharacteristicsProps {
  id: number;
}

export const TankopediaCharacteristics = withErrorWrapper(
  withLocale<TankopediaCharacteristicsProps>(Content)
);

function Content({ id }: TankopediaCharacteristicsProps) {
  Tankopedia.useInitialization(() => tanks.tanks[id], import.meta.env.SSR);

  const characteristics = useCharacteristics("protagonist");
  const rankings = useRankings(characteristics);

  return (
    <div className={styles["characteristics-wrapper"]}>
      <CompareOptions />

      <div className={styles.characteristics}>
        {characteristicsGroups.map((group) => (
          <Group
            key={group.name}
            group={group}
            characteristics={characteristics}
            rankings={rankings}
          />
        ))}
      </div>
    </div>
  );
}

type GroupItem = CharacteristicsGroup["order"][number];

// A toy that needs a characteristic only shows for the tanks that have it
function hasToy(
  { requires }: ToyRenderConfig,
  characteristics: ComputedCharacteristics
) {
  return requires === undefined || characteristics.has(requires);
}

function itemKey(item: GroupItem) {
  if ("toy" in item) return `toy:${item.toy}`;
  if ("label" in item) return `label:${item.label}`;
  return item.name;
}

interface GroupProps {
  group: CharacteristicsGroup;
  characteristics: ComputedCharacteristics;
  rankings: Map<CharacteristicName, CharacteristicRank>;
}

function Group({ group, characteristics, rankings }: GroupProps) {
  const strings = useStrings();
  let toys = 0;
  let characteristicsCount = 0;
  let labelsCount = 0;

  for (const item of group.order) {
    if ("toy" in item) {
      if (hasToy(item, characteristics)) toys++;
    } else if ("label" in item) {
      labelsCount++;
    } else if (characteristics.has(item.name)) {
      characteristicsCount++;
    }
  }

  if (toys + characteristicsCount === 0) return null;

  // Labels only head characteristics, so they go when there are none
  const hasLabels = characteristicsCount > 0;
  const items = characteristicsCount + (hasLabels ? labelsCount : 0);
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
          <Heading size="3">
            {
              (strings.tanks.characteristics.titles as Record<string, string>)[
                group.name
              ]
            }
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
          <Fragment key={itemKey(item)}>
            {"toy" in item && hasToy(item, characteristics) && (
              <ToyAssigner characteristics={characteristics} toy={item.toy} />
            )}
            {"label" in item && hasLabels && <Label {...item} />}
            {"name" in item && characteristics.has(item.name) && (
              <Item
                config={item}
                value={characteristics.get(item.name)!}
                ranking={rankings.get(item.name)}
              />
            )}
          </Fragment>
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

        <CharacteristicValue config={config} value={value} />
      </div>

      <div className={styles.ranking}>
        {ranking ? <Bar value={ranking.score} /> : <BarStub />}

        {ranking && (
          <Text lowContrast size="minor" className={styles.number}>
            {literals(strings.units.fraction, {
              numerator: ranking.rank,
              denominator: ranking.total,
            })}
          </Text>
        )}
      </div>
    </span>
  );
}

function CompareOptions() {
  const protagonist = useDuelModules("protagonist");
  const relativeAgainst = Tankopedia.use((state) => state.relative_against);

  const strings = useStrings();

  const options = useRef([
    {
      value: `${TankopediaRelativeAgainst.ClassAndTier}`,
      relativeAgainst: TankopediaRelativeAgainst.ClassAndTier,
      label: literals(strings.tanks.characteristics.compare.class, {
        tier: romanize(protagonist.tank.tier),
        class:
          strings.common.tank_class_short_plural_lowercase[
            protagonist.tank.class
          ],
      }),
    },
    {
      value: `${TankopediaRelativeAgainst.Tier}`,
      relativeAgainst: TankopediaRelativeAgainst.Tier,
      label: literals(strings.tanks.characteristics.compare.tier, {
        tier: romanize(protagonist.tank.tier),
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

// Unranked items get a full neutral bar
function BarStub() {
  return <div className={styles["bar-wrapper"]} />;
}

interface BarProps {
  value: number;
}

function Bar({ value }: BarProps) {
  return (
    <div className={styles["bar-wrapper"]}>
      <div
        className={styles.bar}
        data-ranking={Math.round(value * RANKING_STEPS)}
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
