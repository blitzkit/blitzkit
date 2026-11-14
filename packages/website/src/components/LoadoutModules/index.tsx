import { alias, formatCompact, romanize, tankIcon } from "@blitzkit/core";
import {
  ModuleType,
  type EngineDefinition,
  type GunDefinition,
  type TankDefinition,
  type TrackDefinition,
  type TurretDefinition,
  type Unlock,
} from "@blitzkit/protos";
import { DoubleArrowDownIcon, DoubleArrowUpIcon } from "@radix-ui/react-icons";
import { useCallback, useMemo } from "react";
import { api } from "../../api/dynamic";
import { useLocale } from "../../hooks/useLocale";
import { useStrings } from "../../hooks/useStrings";
import { useUnwrapper } from "../../hooks/useUnwrapper";
import { layoutModuleTree } from "../../tankopedia/moduleTreeLayout";
import type { TankState } from "../../tankopedia/tankState";
import { Discriminator } from "../Discriminator";
import { IconButton } from "../IconButton";
import { LinkI18n } from "../LinkI18n";
import { LoadoutSection } from "../LoadoutSection";
import { Text } from "../Text";
import { Tooltip } from "../Tooltip";
import styles from "./index.module.css";

const tanks = await api.tanks();

interface ContentProps {
  tank: TankDefinition;
  selected: Pick<TankState, "turret" | "gun" | "engine" | "track">;
  onSelect: (unlock: Unlock) => void;
}

const moduleIconNames: Record<ModuleType, string> = {
  [ModuleType.MODULE_TYPE_VEHICLE]: "",
  [ModuleType.MODULE_TYPE_ENGINE]: "engine",
  [ModuleType.MODULE_TYPE_TRACKS]: "chassis",
  [ModuleType.MODULE_TYPE_TURRET]: "turret",
  [ModuleType.MODULE_TYPE_GUN]: "gun",
};

type AnyModule =
  | TurretDefinition
  | GunDefinition
  | TrackDefinition
  | EngineDefinition;

function stock(type: ModuleType, id: number) {
  return { id, type, cost: { type: "xp", value: 0 } } satisfies Unlock;
}

function Content({ tank, selected, onSelect }: ContentProps) {
  const unwrap = useUnwrapper();

  // The same gun can sit on several turrets; reversing keeps the first one,
  // which is what a linear find would return
  const modules = useMemo(
    () =>
      new Map<ModuleType, Map<number, AnyModule>>([
        [
          ModuleType.MODULE_TYPE_TRACKS,
          new Map(tank.tracks.map((track) => [track.id, track])),
        ],
        [
          ModuleType.MODULE_TYPE_ENGINE,
          new Map(tank.engines.map((engine) => [engine.id, engine])),
        ],
        [
          ModuleType.MODULE_TYPE_TURRET,
          new Map(tank.turrets.map((turret) => [turret.id, turret])),
        ],
        [
          ModuleType.MODULE_TYPE_GUN,
          new Map(
            tank.turrets
              .flatMap((turret) => turret.guns)
              .toReversed()
              .map((gun) => [gun.id, gun])
          ),
        ],
      ]),
    [tank]
  );

  const resolve = useCallback(
    (unlock: Unlock) =>
      unlock.type === ModuleType.MODULE_TYPE_VEHICLE
        ? (tanks.tanks[unlock.id] as TankDefinition | undefined)
        : modules.get(unlock.type)?.get(unlock.id),
    [modules]
  );

  const { cells, columns, rows } = useMemo(
    () =>
      layoutModuleTree(
        [
          stock(ModuleType.MODULE_TYPE_GUN, tank.turrets[0].guns[0].id),
          stock(ModuleType.MODULE_TYPE_TURRET, tank.turrets[0].id),
          stock(ModuleType.MODULE_TYPE_ENGINE, tank.engines[0].id),
          stock(ModuleType.MODULE_TYPE_TRACKS, tank.tracks[0].id),
        ].filter((unlock) => resolve(unlock) !== undefined),
        (unlock) => {
          const module = resolve(unlock);
          const children =
            module !== undefined && "unlocks" in module ? module.unlocks : [];

          return children.filter((child) => resolve(child) !== undefined);
        },
        tank.module_positions
      ),
    [tank, resolve]
  );

  // Prices hang below the modules, so room is only reserved if the bottom row has one
  const bottomRow = Math.max(...cells.map((cell) => cell.position[0]));
  const hasBottomCost = cells.some(
    (cell) =>
      cell.position[0] === bottomRow &&
      cell.unlock !== undefined &&
      cell.unlock.cost!.value > 0
  );

  return (
    <div
      className={styles.tree}
      data-has-bottom-cost={hasBottomCost}
      style={{
        // Transposed: the layout's columns (depth) become rows
        gridTemplateColumns: `repeat(${rows}, var(--module-size))`,
        gridTemplateRows: `repeat(${columns}, var(--module-size))`,
      }}
    >
      {cells.map((cell) => {
        const module = cell.unlock && resolve(cell.unlock);

        return (
          <div
            key={cell.position.join(",")}
            className={styles.cell}
            style={{ gridColumn: cell.position[1], gridRow: cell.position[0] }}
          >
            {cell.trunkUp && <span className={styles["trunk-left"]} />}
            {cell.trunkDown && <span className={styles["trunk-right"]} />}
            {cell.snakeUp && <span className={styles["snake-left"]} />}
            {cell.snakeDown && <span className={styles["snake-right"]} />}
            {cell.right && <span className={styles.bottom} />}
            {cell.left && <span className={styles.top} />}

            {cell.unlock && module && (
              <ModuleNode
                unlock={cell.unlock}
                module={module}
                tank={tank}
                selected={selected}
                tooltip={unwrap(module.name!)}
                onSelect={onSelect}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface ModuleNodeProps {
  unlock: Unlock;
  module: AnyModule | TankDefinition;
  tank: TankDefinition;
  selected: ContentProps["selected"];
  tooltip: string;
  onSelect: ContentProps["onSelect"];
}

function ModuleNode({
  unlock,
  module,
  tank,
  selected,
  tooltip,
  onSelect,
}: ModuleNodeProps) {
  const locale = useLocale();

  const isTank = unlock.type === ModuleType.MODULE_TYPE_VEHICLE;
  const topTurret = tank.turrets.at(-1)!;

  const isSelected =
    (unlock.type === ModuleType.MODULE_TYPE_TURRET &&
      selected.turret === unlock.id) ||
    (unlock.type === ModuleType.MODULE_TYPE_GUN &&
      selected.gun === unlock.id) ||
    (unlock.type === ModuleType.MODULE_TYPE_ENGINE &&
      selected.engine === unlock.id) ||
    (unlock.type === ModuleType.MODULE_TYPE_TRACKS &&
      selected.track === unlock.id);

  const isTop =
    (unlock.type === ModuleType.MODULE_TYPE_TURRET &&
      unlock.id === topTurret.id) ||
    (unlock.type === ModuleType.MODULE_TYPE_GUN &&
      unlock.id === topTurret.guns.at(-1)!.id) ||
    (unlock.type === ModuleType.MODULE_TYPE_ENGINE &&
      unlock.id === tank.engines.at(-1)!.id) ||
    (unlock.type === ModuleType.MODULE_TYPE_TRACKS &&
      unlock.id === tank.tracks.at(-1)!.id);

  const button = (
    <IconButton
      radius="1"
      variant={isSelected ? "surface" : "soft"}
      color={isSelected ? (isTop ? "amber" : undefined) : "gray"}
      className={styles.module}
      data-major={unlock.type === ModuleType.MODULE_TYPE_VEHICLE}
      onClick={() => {
        if (!isTank) onSelect(unlock);
      }}
    >
      <img
        alt={tooltip}
        src={
          isTank
            ? tankIcon(unlock.id)
            : alias(
                "api",
                `/icons/modules/${moduleIconNames[unlock.type]}.webp`
              )
        }
        className={styles.icon}
      />

      <Discriminator corner="top-left">{romanize(module.tier)}</Discriminator>

      {unlock.cost!.value > 0 && (
        <div className={styles.price}>
          <Text size="minor">{formatCompact(locale, unlock.cost!.value)}</Text>
          <img
            alt={unlock.cost!.type}
            src={alias("api", `/icons/currencies/${unlock.cost!.type}.webp`)}
          />
        </div>
      )}
    </IconButton>
  );

  return (
    <Tooltip tooltip={tooltip}>
      {isTank ? (
        <LinkI18n
          locale={locale}
          href={`/tanks/${tanks.tanks[unlock.id].slug}`}
        >
          {button}
        </LinkI18n>
      ) : (
        button
      )}
    </Tooltip>
  );
}

interface LoadoutModulesProps {
  tank: TankDefinition;
  selected: Pick<TankState, "turret" | "gun" | "engine" | "track">;
  onSelect: (unlock: Unlock) => void;
  onStock: () => void;
  onMaximize: () => void;
}

export function LoadoutModules({
  tank,
  selected,
  onSelect,
  onStock,
  onMaximize,
}: LoadoutModulesProps) {
  const strings = useStrings();
  const hasUpgrades =
    tank.turrets.length > 1 ||
    tank.turrets[0].guns.length > 1 ||
    tank.engines.length > 1 ||
    tank.tracks.length > 1;

  return (
    <LoadoutSection
      title={strings.tanks.loadout.modules}
      actions={
        hasUpgrades && (
          <>
            <IconButton
              highContrast
              color="gray"
              size="minor"
              variant="ghost"
              onClick={onStock}
            >
              <DoubleArrowUpIcon />
            </IconButton>

            <IconButton
              highContrast
              color="gray"
              size="minor"
              variant="ghost"
              onClick={onMaximize}
            >
              <DoubleArrowDownIcon />
            </IconButton>
          </>
        )
      }
    >
      <Content tank={tank} selected={selected} onSelect={onSelect} />
    </LoadoutSection>
  );
}
