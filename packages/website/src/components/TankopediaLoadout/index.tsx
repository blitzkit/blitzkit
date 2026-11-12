import {
  alias,
  formatCompact,
  MAX_SKILL_LEVEL,
  permanentSkills,
  romanize,
  tankIcon,
} from "@blitzkit/core";
import {
  ModuleType,
  type Consumable,
  type EngineDefinition,
  type EquipmentSlot,
  type GunDefinition,
  type Provision,
  type TankDefinition,
  type TrackDefinition,
  type TurretDefinition,
  type Unlock,
} from "@blitzkit/protos";
import {
  ClockIcon,
  DoubleArrowDownIcon,
  DoubleArrowUpIcon,
  ResetIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { chunk } from "lodash-es";
import { useCallback, useMemo } from "react";
import { api } from "../../api/dynamic";
import { equipmentColumns } from "../../config/equipment";
import { DuelModule, useDuel } from "../../hooks/useDuel";
import { useEquipmentPreset } from "../../hooks/useEquipmentPreset";
import { useLocale } from "../../hooks/useLocale";
import { useProvision } from "../../hooks/useProvision";
import { useStrings } from "../../hooks/useStrings";
import { useTankCompatibility } from "../../hooks/useTankCompatibility";
import { useUnwrapper } from "../../hooks/useUnwrapper";
import { Tankopedia } from "../../stores/tankopedia";
import { layoutModuleTree } from "../../tankopedia/moduleTreeLayout";
import { vehicleStatusKeys } from "../../tankopedia/tankState";
import type { ComputedCharacteristics } from "../../types/characteristics";
import { Button } from "../Button";
import { Discriminator } from "../Discriminator";
import { Heading } from "../Heading";
import { IconButton } from "../IconButton";
import { LinkI18n } from "../LinkI18n";
import { Text } from "../Text";
import { Tooltip } from "../Tooltip";
import styles from "./index.module.css";

// TODO: across the entire repo, wrap these in Promise.all's
const equipment = await api.equipment();
const provisions = await api.provisions();
const consumables = await api.consumables();
const tanks = await api.tanks();
const skills = await api.skills();

interface TankopediaLoadoutProps {
  characteristics: ComputedCharacteristics;
}

export function TankopediaLoadout({ characteristics }: TankopediaLoadoutProps) {
  return (
    <>
      <Modules />
      <Shells />
      <Equipment />
      <Provisions />
      <Consumables characteristics={characteristics} />
      <CrewSkills />
      <Status />
    </>
  );
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

function Modules() {
  const strings = useStrings();
  const tank = useDuel("protagonist", DuelModule.Tank);
  const hasUpgrades =
    tank.turrets.length > 1 ||
    tank.turrets[0].guns.length > 1 ||
    tank.engines.length > 1 ||
    tank.tracks.length > 1;

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <Heading size="4">{strings.tanks.loadout.modules}</Heading>

        {hasUpgrades && (
          <div className={styles["upgrade-buttons"]}>
            <IconButton
              color="gray"
              variant="soft"
              onClick={() => {
                Tankopedia.mutate((draft) => {
                  const turret = tank.turrets[0];
                  const gun = turret.guns[0];

                  draft.protagonist.turret = turret.id;
                  draft.protagonist.gun = gun.id;
                  draft.protagonist.shell = gun.shells[0].id;
                  draft.protagonist.engine = tank.engines[0].id;
                  draft.protagonist.track = tank.tracks[0].id;
                });
              }}
            >
              <DoubleArrowUpIcon />
            </IconButton>

            <IconButton
              color="gray"
              variant="soft"
              aria-label={`${strings.tanks.loadout.maximize} ${strings.tanks.loadout.modules}`}
              onClick={() => {
                Tankopedia.mutate((draft) => {
                  const turret = tank.turrets.at(-1)!;
                  const gun = turret.guns.at(-1)!;

                  draft.protagonist.turret = turret.id;
                  draft.protagonist.gun = gun.id;
                  draft.protagonist.shell = gun.shells[0].id;
                  draft.protagonist.engine = tank.engines.at(-1)!.id;
                  draft.protagonist.track = tank.tracks.at(-1)!.id;
                });
              }}
            >
              <DoubleArrowDownIcon />
            </IconButton>
          </div>
        )}
      </div>

      <ModuleTree />
    </div>
  );
}

function stock(type: ModuleType, id: number) {
  return { id, type, cost: { type: "xp", value: 0 } } satisfies Unlock;
}

function ModuleTree() {
  const tank = useDuel("protagonist", DuelModule.Tank);
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
              .map((gun) => [gun.id, gun]),
          ),
        ],
      ]),
    [tank],
  );

  const resolve = useCallback(
    (unlock: Unlock) =>
      unlock.type === ModuleType.MODULE_TYPE_VEHICLE
        ? (tanks.tanks[unlock.id] as TankDefinition | undefined)
        : modules.get(unlock.type)?.get(unlock.id),
    [modules],
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
        tank.module_positions,
      ),
    [tank, resolve],
  );

  return (
    <div
      className={styles.tree}
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
                tooltip={unwrap(module.name!)}
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
  tooltip: string;
}

function ModuleNode({ unlock, module, tooltip }: ModuleNodeProps) {
  const locale = useLocale();
  const tank = useDuel("protagonist", DuelModule.Tank);

  const isTank = unlock.type === ModuleType.MODULE_TYPE_VEHICLE;
  const topTurret = tank.turrets.at(-1)!;

  const isSelected = Tankopedia.use((state) => {
    switch (unlock.type) {
      case ModuleType.MODULE_TYPE_TURRET:
        return state.protagonist.turret === unlock.id;

      case ModuleType.MODULE_TYPE_GUN:
        return state.protagonist.gun === unlock.id;

      case ModuleType.MODULE_TYPE_ENGINE:
        return state.protagonist.engine === unlock.id;

      case ModuleType.MODULE_TYPE_TRACKS:
        return state.protagonist.track === unlock.id;

      default:
        return false;
    }
  });

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
      aria-label={tooltip}
      size="major"
      radius="1"
      variant={isSelected ? "surface" : "soft"}
      color={isSelected ? (isTop ? "amber" : undefined) : "gray"}
      className={styles.module}
      data-major={unlock.type === ModuleType.MODULE_TYPE_VEHICLE}
      onClick={() => {
        if (isTank) return;

        Tankopedia.mutate((draft) => {
          switch (unlock.type) {
            case ModuleType.MODULE_TYPE_TURRET: {
              const turret = tank.turrets.find((t) => t.id === unlock.id)!;
              const gun =
                turret.guns.find((g) => g.id === draft.protagonist.gun) ??
                turret.guns.at(-1)!;

              draft.protagonist.turret = turret.id;
              draft.protagonist.gun = gun.id;
              draft.protagonist.shell = gun.shells[0].id;
              break;
            }

            case ModuleType.MODULE_TYPE_GUN: {
              const turret = tank.turrets
                .find((t) => t.id === draft.protagonist.turret)!
                .guns.some((g) => g.id === unlock.id)
                ? tank.turrets.find((t) => t.id === draft.protagonist.turret)!
                : tank.turrets.find((t) =>
                    t.guns.some((g) => g.id === unlock.id),
                  )!;
              const gun = turret.guns.find((g) => g.id === unlock.id)!;

              draft.protagonist.turret = turret.id;
              draft.protagonist.gun = gun.id;
              draft.protagonist.shell = gun.shells[0].id;
              break;
            }

            case ModuleType.MODULE_TYPE_ENGINE:
              draft.protagonist.engine = unlock.id;
              break;

            case ModuleType.MODULE_TYPE_TRACKS:
              draft.protagonist.track = unlock.id;
              break;
          }
        });
      }}
    >
      <img
        alt={tooltip}
        src={
          isTank
            ? tankIcon(unlock.id)
            : alias(
                "api",
                `/icons/modules/${moduleIconNames[unlock.type]}.webp`,
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

function CrewSkills() {
  const strings = useStrings();
  const selectedSkills = Tankopedia.use((state) => state.environment.skills);

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <Heading size="4">{strings.tanks.loadout.skills}</Heading>

        <div className={styles["upgrade-buttons"]}>
          <IconButton
            color="red"
            aria-label={`${strings.tanks.loadout.clear} ${strings.tanks.loadout.skills}`}
            onClick={() => {
              Tankopedia.mutate((draft) => {
                Object.keys(draft.environment.skills).forEach((skill) => {
                  draft.environment.skills[skill] = 0;
                });
              });
            }}
          >
            <TrashIcon />
          </IconButton>

          <IconButton
            color="gray"
            highContrast
            aria-label={`${strings.tanks.loadout.maximize} ${strings.tanks.loadout.skills}`}
            onClick={() => {
              Tankopedia.mutate((draft) => {
                Object.keys(draft.environment.skills).forEach((skill) => {
                  draft.environment.skills[skill] = MAX_SKILL_LEVEL;
                });
              });
            }}
          >
            <DoubleArrowUpIcon />
          </IconButton>
        </div>
      </div>

      <div className={styles["crew-skills"]}>
        {Object.entries(skills.classes).map(([tankClass, group]) => (
          <div key={tankClass} className={styles.row}>
            {group.skills.map((skill) => (
              <CrewSkillEntry
                key={skill}
                id={skill}
                level={selectedSkills[skill]}
                permanent={permanentSkills.includes(skill)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface CrewSkillEntryProps {
  id: string;
  level: number;
  permanent: boolean;
}

function CrewSkillEntry({ id, level, permanent }: CrewSkillEntryProps) {
  return (
    <IconButton
      size="major"
      radius="1"
      className={styles.skill}
      color={level === 0 ? "gray" : permanent ? undefined : "amber"}
      variant={level === 0 ? "soft" : "surface"}
      onClick={(event) => {
        Tankopedia.mutate((draft) => {
          if (event.shiftKey) {
            draft.environment.skills[id] = level === 0 ? MAX_SKILL_LEVEL : 0;
          } else {
            draft.environment.skills[id] =
              level === 0 ? MAX_SKILL_LEVEL : level - 1;
          }
        });
      }}
    >
      <img src={alias("api", `/icons/skills/${id}.webp`)} />
      {level > 0 && <span className={styles.level}>{romanize(level)}</span>}
    </IconButton>
  );
}

function Status() {
  const strings = useStrings();
  const status = Tankopedia.use((state) => state.protagonist.status);

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <Heading size="4">{strings.tanks.loadout.status}</Heading>

        <IconButton
          color="red"
          aria-label={`${strings.tanks.loadout.clear} ${strings.tanks.loadout.status}`}
          onClick={() => {
            Tankopedia.mutate((draft) => {
              draft.protagonist.consumables = [];
            });
          }}
        >
          <TrashIcon />
        </IconButton>
      </div>

      <div className={styles.status}>
        {vehicleStatusKeys.map((group, index) => (
          <div key={index} className={styles.group}>
            {group.map((key) => (
              <IconButton
                key={key}
                aria-label={key.replaceAll("_", " ")}
                aria-pressed={status[key]}
                radius="1"
                className={styles.state}
                color={status[key] ? "amber" : "gray"}
                variant={status[key] ? "surface" : "soft"}
                onClick={() => {
                  Tankopedia.mutate((draft) => {
                    draft.protagonist.status[key] =
                      !draft.protagonist.status[key];
                  });
                }}
              >
                <img src={`/media/status/${key}.png`} />
              </IconButton>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Shells() {
  const strings = useStrings();
  const unwrap = useUnwrapper();

  const gun = useDuel("protagonist", DuelModule.Gun);
  const shell = useDuel("protagonist", DuelModule.Shell);

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <Heading size="4">{strings.tanks.loadout.shells}</Heading>
      </div>

      <div className={styles.shells}>
        {gun.shells.map((candidate) => {
          const isSelected = candidate.id === shell.id;
          const name = unwrap(candidate.name!);

          return (
            <Tooltip key={candidate.id} tooltip={name}>
              <IconButton
                aria-label={name}
                size="major"
                radius="1"
                color={isSelected ? undefined : "gray"}
                variant={isSelected ? "surface" : "soft"}
                parentListChild="horizontal"
                onClick={() => {
                  Tankopedia.mutate((draft) => {
                    draft.protagonist.shell = candidate.id;
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
    </div>
  );
}

function Provisions() {
  const strings = useStrings();
  const tank = useDuel("protagonist", DuelModule.Tank);
  const gun = useDuel("protagonist", DuelModule.Gun);
  const isCompatible = useTankCompatibility(tank, gun);

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <Heading size="4">{strings.tanks.loadout.provisions}</Heading>

        <IconButton
          color="red"
          aria-label={`${strings.tanks.loadout.clear} ${strings.tanks.loadout.provisions}`}
          onClick={() => {
            Tankopedia.mutate((draft) => {
              draft.protagonist.provisions = [];
            });
          }}
        >
          <TrashIcon />
        </IconButton>
      </div>

      <div className={styles.provisions}>
        {Object.entries(provisions.provisions).map(([id, provision]) => {
          if (
            provision.game_mode_exclusive ||
            !isCompatible(provision.include, provision.exclude)
          ) {
            return null;
          }

          return (
            <ProvisionEntry key={id} id={Number(id)} provision={provision} />
          );
        })}
      </div>
    </div>
  );
}

interface ProvisionEntryProps {
  id: number;
  provision: Provision;
}

function ProvisionEntry({ id, provision }: ProvisionEntryProps) {
  const isSelected = useProvision("protagonist", id);
  const tank = useDuel("protagonist", DuelModule.Tank);
  const selectedCount = Tankopedia.use(
    (state) => state.protagonist.provisions.length,
  );

  const unwrap = useUnwrapper();

  const disabled = !isSelected && selectedCount >= tank.max_provisions;

  return (
    <Tooltip tooltip={unwrap(provision.name)}>
      <IconButton
        aria-label={unwrap(provision.name)}
        size="major"
        radius="1"
        variant={isSelected ? "surface" : "soft"}
        color={isSelected ? undefined : "gray"}
        className={styles.consumable}
        disabled={disabled}
        onClick={() => {
          Tankopedia.mutate((draft) => {
            const index = draft.protagonist.provisions.indexOf(id);

            if (index === -1) {
              if (draft.protagonist.provisions.length === tank.max_provisions) {
                return;
              }

              draft.protagonist.provisions.push(id);
            } else {
              draft.protagonist.provisions.splice(index, 1);
            }
          });
        }}
      >
        <img src={alias("api", `/icons/provisions/${provision.id}.webp`)} />
      </IconButton>
    </Tooltip>
  );
}

interface ConsumablesProps {
  characteristics: ComputedCharacteristics;
}

function Consumables({ characteristics }: ConsumablesProps) {
  const strings = useStrings();
  const tank = useDuel("protagonist", DuelModule.Tank);
  const gun = useDuel("protagonist", DuelModule.Gun);
  const isCompatible = useTankCompatibility(tank, gun);

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <Heading size="4">{strings.tanks.loadout.consumables}</Heading>

        <IconButton
          color="red"
          aria-label={`${strings.tanks.loadout.clear} ${strings.tanks.loadout.consumables}`}
          onClick={() => {
            Tankopedia.mutate((draft) => {
              draft.protagonist.consumables = [];
            });
          }}
        >
          <TrashIcon />
        </IconButton>
      </div>

      <div className={styles.consumables}>
        {Object.entries(consumables.consumables).map(([id, consumable]) => {
          if (
            consumable.game_mode_exclusive ||
            !isCompatible(consumable.include, consumable.exclude)
          ) {
            return null;
          }

          return (
            <ConsumableEntry key={id} id={Number(id)} consumable={consumable} />
          );
        })}
      </div>
    </div>
  );
}

interface ConsumableProps {
  id: number;
  consumable: Consumable;
}

function ConsumableEntry({ id, consumable }: ConsumableProps) {
  const tank = useDuel("protagonist", DuelModule.Tank);
  const isSelected = Tankopedia.use((state) =>
    state.protagonist.consumables.includes(id),
  );
  const selectedCount = Tankopedia.use(
    (state) => state.protagonist.consumables.length,
  );

  const unwrap = useUnwrapper();

  const disabled = !isSelected && selectedCount >= tank.max_consumables;

  return (
    <div className={styles["consumable-wrapper"]}>
      <Tooltip tooltip={unwrap(consumable.name)}>
        <Button
          aria-label={unwrap(consumable.name)}
          radius="1"
          variant={isSelected ? "surface" : "soft"}
          color={isSelected ? undefined : "gray"}
          className={styles.consumable}
          disabled={disabled}
          onClick={() => {
            Tankopedia.mutate((draft) => {
              const index = draft.protagonist.consumables.indexOf(id);

              if (index === -1) {
                if (
                  draft.protagonist.consumables.length === tank.max_consumables
                ) {
                  return;
                }

                draft.protagonist.consumables.push(id);
              } else {
                draft.protagonist.consumables.splice(index, 1);
              }
            });
          }}
        >
          <img src={alias("api", `/icons/consumables/${consumable.id}.webp`)} />
          <div className={styles.info}>
            <Text lowContrast size="minor">
              <div className={styles.entry}>
                <ClockIcon />
                10s
              </div>
            </Text>

            <Text lowContrast size="minor">
              <div className={styles.entry}>
                <ResetIcon />
                10s
              </div>
            </Text>
          </div>
        </Button>
      </Tooltip>

      {/* <Price price={price} /> */}
    </div>
  );
}

function Equipment() {
  const strings = useStrings();
  const tank = useDuel("protagonist", DuelModule.Tank);
  const equipment = useEquipmentPreset(tank.equipment_preset);

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <Heading size="4">{strings.tanks.loadout.equipment}</Heading>

        <IconButton
          color="red"
          aria-label={`${strings.tanks.loadout.clear} ${strings.tanks.loadout.equipment}`}
          onClick={() => {
            Tankopedia.mutate((draft) => {
              for (const key in draft.protagonist.equipment) {
                delete draft.protagonist.equipment[key];
              }
            });
          }}
        >
          <TrashIcon />
        </IconButton>
      </div>

      <div className={styles.equipment}>
        {chunk(equipment.slots, equipmentColumns).map((chunk, index) => (
          <EquipmentRow key={index} chunk={chunk} rowIndex={index} />
        ))}
      </div>
    </div>
  );
}

interface EquipmentRowProps {
  chunk: EquipmentSlot[];
  rowIndex: number;
}

function EquipmentRow({ chunk, rowIndex }: EquipmentRowProps) {
  return (
    <div className={styles.row}>
      {chunk.map((slot, index) => (
        <EquipmentSlotEntry
          key={index}
          slot={slot}
          rowIndex={rowIndex}
          columnIndex={index}
        />
      ))}
    </div>
  );
}

interface EquipmentSlotProps {
  slot: EquipmentSlot;
  rowIndex: number;
  columnIndex: number;
}

function EquipmentSlotEntry({
  slot,
  rowIndex,
  columnIndex,
}: EquipmentSlotProps) {
  // const { price } = equipment.price.unlock_slot_prices[equipmentIndex];

  return (
    <div className={styles.slots}>
      <div className={styles.options}>
        {slot.options.map((id, index) => (
          <EquipmentOption
            key={id}
            optionIndex={index}
            rowIndex={rowIndex}
            columnIndex={columnIndex}
          />
        ))}
      </div>

      {/* <Price price={price!} /> */}
    </div>
  );
}

interface EquipmentOptionProps {
  optionIndex: number;
  rowIndex: number;
  columnIndex: number;
}

function EquipmentOption({
  optionIndex,
  rowIndex,
  columnIndex,
}: EquipmentOptionProps) {
  const equipmentIndex = rowIndex * equipmentColumns + columnIndex;

  const tank = useDuel("protagonist", DuelModule.Tank);
  const equipmentPreset = useEquipmentPreset(tank.equipment_preset);
  const unwrap = useUnwrapper();

  const slot = equipmentPreset.slots[equipmentIndex];
  const id = slot.options[optionIndex];
  const specificEquipment = equipment.equipments[id];

  const isSelected = Tankopedia.use(
    (state) =>
      equipmentIndex in state.protagonist.equipment &&
      state.protagonist.equipment[equipmentIndex] === optionIndex,
  );

  return (
    <Tooltip tooltip={unwrap(specificEquipment.name)}>
      <IconButton
        aria-label={unwrap(specificEquipment.name)}
        size="major"
        color={isSelected ? undefined : "gray"}
        variant={isSelected ? "surface" : "soft"}
        radius="1"
        parentListChild="horizontal"
        className={styles.slot}
        onClick={() => {
          Tankopedia.mutate((draft) => {
            if (isSelected) {
              delete draft.protagonist.equipment[equipmentIndex];
            } else {
              draft.protagonist.equipment[equipmentIndex] = optionIndex;
            }
          });
        }}
      >
        <img
          className={styles.icon}
          alt={unwrap(specificEquipment.name)}
          src={alias("api", `/icons/equipment/${id}.webp`)}
        />
      </IconButton>
    </Tooltip>
  );
}
