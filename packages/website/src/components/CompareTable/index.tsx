import { alias } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n/src/literals";
import {
  CaretLeftIcon,
  CaretRightIcon,
  CaretSortIcon,
} from "@radix-ui/react-icons";
import { useMemo } from "react";
import { characteristicsGroups } from "../../config/characteristicsGroups";
import { computeCharacteristics } from "../../hooks/useCharacteristics";
import { useStrings } from "../../hooks/useStrings";
import { useUnwrapper } from "../../hooks/useUnwrapper";
import { Logo } from "../../icons/Logo";
import {
  CompareEphemeral,
  syncShellSlot,
  type CompareMember,
} from "../../stores/compareEphemeral";
import { ComparePersistent } from "../../stores/comparePersistent";
import { TankopediaSortDirection } from "../../stores/tankopediaPersistent";
import { rankingValue } from "../../tankopedia/calculateRankings";
import { resolveTankModules } from "../../tankopedia/resolveTankModules";
import {
  CharacteristicRanking,
  type CharacteristicName,
  type CharacteristicRenderConfig,
  type ComputedCharacteristics,
} from "../../types/characteristics";
import { CharacteristicValue } from "../CharacteristicValue";
import { CompareEnvironment } from "../CompareEnvironment";
import { CompareInsertionMarker } from "../CompareInsertionMarker";
import { CompareLoadout } from "../CompareLoadout";
import { CompareTankCard } from "../CompareTankCard";
import { IconButton } from "../IconButton";
import { Table } from "../Table";
import { Text } from "../Text";
import { Tooltip } from "../Tooltip";
import styles from "./index.module.css";

// Removes one occurrence of each excluded id, keeping other tanks' duplicates
function without(ids: number[], excluded: number[]) {
  const remaining = [...ids];

  for (const id of excluded) {
    remaining.splice(remaining.indexOf(id), 1);
  }

  return remaining;
}

export function CompareTable() {
  const members = CompareEphemeral.use((state) => state.members);
  const environment = CompareEphemeral.use((state) => state.environment);

  // Other tanks' consumables and provisions can reduce a tank's damage, so each
  // tank is computed against a synthetic opponent carrying all of theirs
  const characteristics = useMemo(() => {
    const allConsumables = members.flatMap(({ state }) => state.consumables);
    const allProvisions = members.flatMap(({ state }) => state.provisions);

    return members.map((member) => {
      const antagonist = {
        ...member.state,
        consumables: without(allConsumables, member.state.consumables),
        provisions: without(allProvisions, member.state.provisions),
      };

      return computeCharacteristics(
        {
          protagonist: member.state,
          antagonist: members.length > 1 ? antagonist : member.state,
        },
        environment,
      );
    });
  }, [members, environment]);

  return (
    <Table.Root scrollable>
      <Table.Head>
        <Table.Row>
          <Table.Corner>
            <Logo className={styles.logo} width={64} height={64} />
            <CompareInsertionMarker index={0} />
          </Table.Corner>

          {members.map(({ key, state }, index) => (
            <CompareTankCard
              key={key}
              index={index}
              tank={resolveTankModules(state).tank}
            />
          ))}
        </Table.Row>
      </Table.Head>

      <Table.Body>
        <Table.Row>
          <Table.RowHeader>
            <CompareEnvironment />
          </Table.RowHeader>

          {members.map((member, index) => (
            <LoadoutCell key={member.key} index={index} />
          ))}
        </Table.Row>
      </Table.Body>

      {characteristicsGroups.map((group) => (
        <Group
          key={group.name}
          group={group}
          characteristics={characteristics}
        />
      ))}
    </Table.Root>
  );
}

interface LoadoutCellProps {
  index: number;
}

function LoadoutCell({ index }: LoadoutCellProps) {
  return (
    <Table.Cell className={styles.loadout}>
      <CompareLoadout index={index} />
    </Table.Cell>
  );
}

interface ShellSwitcherProps {
  member: CompareMember;
  index: number;
}

function ShellSwitcher({ member, index }: ShellSwitcherProps) {
  const unwrap = useUnwrapper();
  const { gun, shell } = resolveTankModules(member.state);

  return (
    <div className={styles.shells}>
      {gun.shells.map((candidate, shellIndex) => {
        const isSelected = candidate.id === shell.id;
        const name = unwrap(candidate.name!);

        return (
          <Tooltip key={candidate.id} tooltip={name}>
            <IconButton
              size="minor"
              color={isSelected ? undefined : "gray"}
              variant={isSelected ? "surface" : "soft"}
              parentListChild="horizontal"
              onClick={() => {
                CompareEphemeral.mutate((draft) => {
                  if (draft.syncShells) {
                    syncShellSlot(draft.members, shellIndex);
                  } else {
                    draft.members[index].state.shell = candidate.id;
                  }

                  draft.sorting.by = null;
                });
              }}
            >
              <img
                alt={name}
                src={alias("api", `/icons/shells/${candidate.icon}.webp`)}
              />
            </IconButton>
          </Tooltip>
        );
      })}
    </div>
  );
}

interface GroupProps {
  group: (typeof characteristicsGroups)[number];
  characteristics: ComputedCharacteristics[];
}

function Group({ group, characteristics }: GroupProps) {
  const strings = useStrings();
  const members = CompareEphemeral.use((state) => state.members);
  const items = group.order.filter(
    (item): item is CharacteristicRenderConfig =>
      "name" in item &&
      characteristics.some((computed) => computed.has(item.name)),
  );

  if (items.length === 0) return null;

  const isShellGroup = group.name === "shell";
  const title = (
    strings.tanks.characteristics.titles as Record<string, string>
  )[group.name];

  return (
    <Table.Body>
      <Table.Row>
        <Table.GroupTitle
          colSpan={isShellGroup ? undefined : characteristics.length + 1}
        >
          {title}
        </Table.GroupTitle>

        {isShellGroup &&
          members.map((member, index) => (
            <Table.GroupCell key={member.key} className={styles["shell-cell"]}>
              <ShellSwitcher member={member} index={index} />
            </Table.GroupCell>
          ))}
      </Table.Row>

      {items.map((config) => (
        <Row
          key={config.name}
          config={config}
          characteristics={characteristics}
        />
      ))}
    </Table.Body>
  );
}

interface RowProps {
  config: CharacteristicRenderConfig;
  characteristics: ComputedCharacteristics[];
}

function Row({ config, characteristics }: RowProps) {
  const strings = useStrings();
  const sorting = CompareEphemeral.use((state) => state.sorting);
  const deltaMode = ComparePersistent.use((state) => state.deltaMode);
  const members = CompareEphemeral.use((state) => state.members);

  const values = characteristics.map((computed) =>
    rankingValue(config.name, computed.get(config.name)),
  );
  const truth = values[0];
  const isSorted = sorting.by === config.name;
  const label = (strings.tanks.characteristics.items as Record<string, string>)[
    config.name
  ];

  return (
    <Table.Row>
      <Table.RowHeader>
        <div className={styles.label} data-indent={config.indent}>
          <IconButton
            variant="ghost"
            size="minor"
            color={isSorted ? undefined : "gray"}
            onClick={() => sort(config.name, values, members)}
          >
            {!isSorted && <CaretSortIcon className={styles.sort} />}
            {isSorted &&
              sorting.direction === TankopediaSortDirection.Ascending && (
                <CaretRightIcon />
              )}
            {isSorted &&
              sorting.direction === TankopediaSortDirection.Descending && (
                <CaretLeftIcon />
              )}
          </IconButton>

          <Text>{label}</Text>

          {config.units !== undefined && (
            <Text lowContrast size="minor">
              {literals(strings.units[config.units], { value: "" })}
            </Text>
          )}
        </div>
      </Table.RowHeader>

      {characteristics.map((computed, index) => {
        const value = values[index];
        const output = computed.get(config.name);
        const delta =
          value !== undefined && truth !== undefined ? value - truth : 0;

        return (
          <Table.Cell
            key={members[index].key}
            align="end"
            style={{ backgroundColor: cellColor(config, value, truth) }}
          >
            <div className={styles.value}>
              {output && (
                <CharacteristicValue
                  config={config}
                  value={output}
                  units={false}
                />
              )}

              {delta !== 0 && Number.isFinite(delta) && (
                <>
                  {deltaMode === "absolute" && (
                    <Text lowContrast size="minor">
                      ({delta > 0 ? "+" : ""}
                      {Number(delta.toFixed(config.decimals ?? 2))})
                    </Text>
                  )}

                  {deltaMode === "percentage" && truth !== 0 && (
                    <Text lowContrast size="minor">
                      ({delta > 0 ? "+" : ""}
                      {Math.round((delta / Math.abs(truth!)) * 100)}%)
                    </Text>
                  )}
                </>
              )}
            </div>
          </Table.Cell>
        );
      })}
    </Table.Row>
  );
}

function sort(
  name: CharacteristicName,
  values: (number | undefined)[],
  members: CompareMember[],
) {
  const byKey = new Map(members.map(({ key }, index) => [key, values[index]]));

  CompareEphemeral.mutate((draft) => {
    const ascending =
      draft.sorting?.by === name &&
      draft.sorting.direction === TankopediaSortDirection.Descending;

    // Missing values always sink to the end
    draft.members.sort((a, b) => {
      const valueA = byKey.get(a.key);
      const valueB = byKey.get(b.key);

      if (valueA === undefined && valueB === undefined) return 0;
      if (valueA === undefined) return 1;
      if (valueB === undefined) return -1;

      return ascending ? valueA - valueB : valueB - valueA;
    });

    draft.sorting = {
      by: name,
      direction: ascending
        ? TankopediaSortDirection.Ascending
        : TankopediaSortDirection.Descending,
    };
  });
}

function cellColor(
  config: CharacteristicRenderConfig,
  value: number | undefined,
  truth: number | undefined,
) {
  if (
    config.ranking === CharacteristicRanking.None ||
    value === undefined ||
    truth === undefined ||
    value === truth ||
    !Number.isFinite(value) ||
    !Number.isFinite(truth)
  ) {
    return undefined;
  }

  const higherIsBetter = config.ranking !== CharacteristicRanking.LowerIsBetter;
  const better = higherIsBetter === value > truth;
  const change = truth === 0 ? 1 : Math.abs(value / truth - 1);
  const intensity = Math.round(Math.min(100, change * 2 * 100 + 25));
  const color = better ? "jade" : "red";

  return `color-mix(in srgb, var(--${color}-7) ${intensity}%, var(--${color}-3))`;
}
