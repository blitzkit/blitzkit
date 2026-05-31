import { romanize } from "@blitzkit/core";
import type { ConsumableComponent } from "@protos/blitz_static_consumable_component";
import type { BlitzStaticEquipmentPresetComponent_EquipmentSlot } from "@protos/blitz_static_equipment_preset_component";
import type { BlitzStaticPurchaseComponent } from "@protos/blitz_static_purchase_component";
import { Grade } from "@protos/blitz_static_standard_grades_enum";
import { StandardPrice } from "@protos/blitz_static_standard_price";
import type { UpgradeLine } from "@protos/blitz_static_tank_upgrade_line";
import type { StageParameters } from "@protos/blitz_static_tank_upgrade_single_stage";
import {
  ClockIcon,
  CornerBottomLeftIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  ResetIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { chunk } from "lodash-es";
import { useMemo } from "react";
import { equipmentColumns } from "../../config/equipment";
import {
  alternativeLines,
  isAlternativeLine,
  maxModulesPerRow,
  originalLineName,
} from "../../config/modules";
import { useCompatibility } from "../../hooks/useCompatibility";
import { useConsumables } from "../../hooks/useConsumables";
import { useEquipment } from "../../hooks/useEquipment";
import { useGameStrings } from "../../hooks/useGameStrings";
import { useProtagonist } from "../../hooks/useProtagonist";
import { useStrings } from "../../hooks/useStrings";
import { useTierPrices } from "../../hooks/useTierPrices";
import { useUpgradePreset } from "../../hooks/useUpgradePreset";
import { Tankopedia } from "../../stores/tankopedia";
import type { ComputedCharacteristics } from "../../tankopedia/computeCharacteristics";
import { vehicleStatusKeys } from "../../tankopedia/tankState";
import { Button } from "../Button";
import { Heading } from "../Heading";
import { IconButton } from "../IconButton";
import { Price } from "../Price";
import { Text } from "../Text";
import { Tooltip } from "../Tooltip";
import styles from "./index.module.css";

interface TankopediaLoadoutProps {
  characteristics: ComputedCharacteristics;
}

export function TankopediaLoadout({ characteristics }: TankopediaLoadoutProps) {
  const tank = useProtagonist();

  const showModules = tank.tank!.upgrade_lines.some(
    (line) => line.stages.length > 1 || line.name in alternativeLines,
  );

  return (
    <>
      <State />
      {showModules && <Modules />}
      <Equipment />
      <Consumables characteristics={characteristics} />
    </>
  );
}

function State() {
  const strings = useStrings();
  const status = Tankopedia.use((state) => state.protagonist.status);

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <Heading size="4">{strings.tanks.loadout.state}</Heading>

        <IconButton
          color="red"
          onClick={() => {
            Tankopedia.mutate((draft) => {
              draft.protagonist.consumables = [];
            });
          }}
        >
          <TrashIcon />
        </IconButton>
      </div>

      <div className={styles.states}>
        {vehicleStatusKeys.map((group, index) => (
          <div key={index} className={styles.group}>
            {group.map((key) => (
              <IconButton
                key={key}
                radius="1"
                className={styles.state}
                data-selected={status[key]}
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

interface ConsumablesProps {
  characteristics: ComputedCharacteristics;
}

function Consumables({ characteristics }: ConsumablesProps) {
  const strings = useStrings();
  const consumables = useConsumables();
  const tank = useProtagonist();
  const isCompatible = useCompatibility(tank, characteristics);

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <Heading size="4">{strings.tanks.loadout.consumables}</Heading>

        <IconButton
          color="red"
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
        {Object.entries(consumables.consumables).map(
          ([id, { compatibility, consumable, purchase }]) => {
            if (!isCompatible(compatibility!)) return null;
            return (
              <Consumable
                id={id}
                consumable={consumable!}
                purchase={purchase!}
              />
            );
          },
        )}
      </div>
    </div>
  );
}

interface ConsumableProps {
  id: string;
  consumable: ConsumableComponent;
  purchase: BlitzStaticPurchaseComponent;
}

function Consumable({ id, consumable, purchase }: ConsumableProps) {
  const gameStrings = useGameStrings("ConsumableEntity");
  const isSelected = Tankopedia.use((state) =>
    state.protagonist.consumables.includes(id),
  );
  const tank = useProtagonist();
  const tierPrices = useTierPrices();

  const price = useMemo(() => {
    const { prices } = tierPrices.prices[purchase.price_per_tier_catalog_id];

    for (const { tier_catalog_id, unlock_price } of prices) {
      if (tier_catalog_id === tank.tank!.tier_catalog_id) {
        return unlock_price;
      }
    }

    throw new Error(
      `No price found for tier catalog id ${tank.tank!.tier_catalog_id}`,
    );
  }, [tank.id, purchase.price_per_tier_catalog_id]);

  return (
    <div className={styles["consumable-wrapper"]}>
      <Tooltip tooltip={gameStrings[consumable!.name_key]}>
        <Button
          radius="1"
          variant={isSelected ? "surface" : "soft"}
          color={isSelected ? undefined : "gray"}
          className={styles.consumable}
          onClick={() => {
            Tankopedia.mutate((draft) => {
              const index = draft.protagonist.consumables.indexOf(id);

              if (index === -1) {
                draft.protagonist.consumables.push(id);
              } else {
                draft.protagonist.consumables.splice(index, 1);
              }
            });
          }}
        >
          <img src={`/media/consumables/${id}.webp`} />
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

      <Price price={price} />
    </div>
  );
}

function Equipment() {
  const strings = useStrings();
  const tank = useProtagonist();
  const equipment = useEquipment(tank.tank!);

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <Heading size="4">{strings.tanks.loadout.equipment}</Heading>

        <IconButton
          color="red"
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
        {chunk(equipment.preset.slots, equipmentColumns).map((chunk, index) => (
          <EquipmentRow key={index} chunk={chunk} rowIndex={index} />
        ))}
      </div>
    </div>
  );
}

interface EquipmentRowProps {
  chunk: BlitzStaticEquipmentPresetComponent_EquipmentSlot[];
  rowIndex: number;
}

function EquipmentRow({ chunk, rowIndex }: EquipmentRowProps) {
  return (
    <div className={styles.row}>
      {chunk.map((slot, index) => (
        <EquipmentSlot
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
  slot: BlitzStaticEquipmentPresetComponent_EquipmentSlot;
  rowIndex: number;
  columnIndex: number;
}

function EquipmentSlot({ slot, rowIndex, columnIndex }: EquipmentSlotProps) {
  const equipmentIndex = rowIndex * equipmentColumns + columnIndex;
  const tank = useProtagonist();
  const equipment = useEquipment(tank.tank!);
  const { price } = equipment.price.unlock_slot_prices[equipmentIndex];

  return (
    <div className={styles.slots}>
      <div className={styles.options}>
        {slot.options_catalog_i_ds.map((id, index) => (
          <EquipmentOption
            key={id}
            optionIndex={index}
            rowIndex={rowIndex}
            columnIndex={columnIndex}
          />
        ))}
      </div>

      <Price price={price!} />
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
  const tank = useProtagonist();
  const equipment = useEquipment(tank.tank!);
  const slot = equipment.preset.slots[equipmentIndex];
  const id = slot.options_catalog_i_ds[optionIndex];
  const gameStrings = useGameStrings("EquipmentEntity");

  const isSelected = Tankopedia.use(
    (state) =>
      equipmentIndex in state.protagonist.equipment &&
      state.protagonist.equipment[equipmentIndex] === optionIndex,
  );

  return (
    <Tooltip tooltip={gameStrings[equipment.equipments[id].equipment_name]}>
      <Button
        color={isSelected ? undefined : "gray"}
        variant={isSelected ? "surface" : "soft"}
        data-selected={isSelected}
        radius="1"
        parentArray
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
        <img src={`/media/equipment/${id}.webp`} />
      </Button>
    </Tooltip>
  );
}

function Modules() {
  const strings = useStrings();
  const tank = useProtagonist();
  const upgrades = Tankopedia.use((state) => state.protagonist.upgrades);
  const alternates = Tankopedia.use((state) => state.protagonist.alternates);
  const isStock = useMemo(() => {
    return tank.tank!.upgrade_lines.every((line) => {
      if (isAlternativeLine(line.name)) return true;
      return upgrades[line.name] === 0;
    });
  }, [upgrades]);
  const isUpgraded = useMemo(() => {
    return tank.tank!.upgrade_lines.every((line) => {
      if (isAlternativeLine(line.name)) return true;

      return (
        upgrades[line.name] === line.stages.length - 1 ||
        (line.name in alternates && alternates[line.name])
      );
    });
  }, [upgrades]);

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <Heading size="4">{strings.tanks.loadout.modules}</Heading>

        <div className={styles["upgrade-buttons"]}>
          <IconButton
            variant={isStock ? "solid" : "soft"}
            size="minor"
            array
            onClick={() => {
              Tankopedia.mutate((draft) => {
                for (const line of tank.tank!.upgrade_lines) {
                  if (isAlternativeLine(line.name)) continue;

                  draft.protagonist.upgrades[line.name] = 0;
                  draft.protagonist.alternates[line.name] = false;
                }
              });
            }}
            color="gray"
          >
            <DoubleArrowLeftIcon />
          </IconButton>

          <IconButton
            variant={isUpgraded ? "solid" : "soft"}
            size="minor"
            array
            onClick={() => {
              Tankopedia.mutate((draft) => {
                for (const line of tank.tank!.upgrade_lines) {
                  draft.protagonist.upgrades[line.name] =
                    line.stages.length - 1;

                  if (isAlternativeLine(line.name)) {
                    const original = originalLineName(line.name)!;
                    draft.protagonist.alternates[original] = true;
                  }
                }
              });
            }}
            color="gray"
          >
            <DoubleArrowRightIcon />
          </IconButton>
        </div>
      </div>

      <div className={styles.lines}>
        {/* TODO: hide lines with 1 module except for alts */}
        {tank.tank!.upgrade_lines.map((line) => (
          <Line
            key={line.name}
            name={line.name}
            lines={tank.tank!.upgrade_lines}
          />
        ))}
      </div>
    </div>
  );
}

interface LineProps {
  name: string;
  lines: UpgradeLine[];
}

function Line({ name, lines }: LineProps) {
  const combinedLines = useMemo(() => {
    const names: string[] = [name];

    for (const originalLine in alternativeLines) {
      const alternativeLine = alternativeLines[originalLine];

      if (
        originalLine === name &&
        lines.some((line) => line.name === alternativeLine)
      ) {
        names.push(alternativeLine);
      }
    }

    return names;
  }, [name]);

  return (
    <div className={styles.line}>
      {!isAlternativeLine(name) &&
        combinedLines.map((name) => (
          <div className={styles["chunks-wrapper"]}>
            <LineInner key={name} name={name} lines={lines} />
          </div>
        ))}
    </div>
  );
}

function LineInner({ name, lines }: LineProps) {
  const line = lines.find((line) => line.name === name)!;

  return chunk(line.stages, maxModulesPerRow).map((chunk, wrapIndex) => (
    <div className={styles["line-wrap"]}>
      {wrapIndex > 0 && (
        <Text size="minor" className={styles["wrap-marker"]} lowContrast>
          <CornerBottomLeftIcon />
        </Text>
      )}

      {chunk.map((stage, elementIndex) => (
        <LineElement
          key={elementIndex}
          index={wrapIndex * maxModulesPerRow + elementIndex}
          lineName={name}
          stage={stage}
        />
      ))}
    </div>
  ));
}

interface LineElementProps {
  index: number;
  lineName: string;
  stage: StageParameters;
}

function LineElement({ index, lineName, stage }: LineElementProps) {
  const upgrades = Tankopedia.use((state) => state.protagonist.upgrades);
  const alternates = Tankopedia.use((state) => state.protagonist.alternates);
  const tank = useProtagonist();
  const strings = useStrings();
  const gameStrings = useGameStrings("TankEntity");
  const upgradePreset = useUpgradePreset(tank.tank!.tank_upgrade_preset);

  let price: StandardPrice | undefined;

  switch (stage.grade) {
    case Grade.GRADE_COMMON:
      price = upgradePreset.common_grade_price;
      break;

    case Grade.GRADE_RARE:
      price = upgradePreset.rare_grade_price;
      break;

    case Grade.GRADE_EPIC:
      price = upgradePreset.unique_grade_price;
      break;

    case Grade.GRADE_LEGENDARY:
      price = upgradePreset.legendary_grade_price;
      break;
  }

  for (const override of upgradePreset.prices_overrides) {
    if (override.stage_tech_name !== stage.tech_name) continue;
    price = override.price;
  }

  price ??= StandardPrice.create();

  let isSelected: boolean;

  if (isAlternativeLine(lineName)) {
    const originalLine = originalLineName(lineName);
    isSelected = alternates[originalLine!];
  } else {
    if (alternates[lineName]) {
      isSelected = false;
    } else {
      isSelected = upgrades[lineName] === index;
    }
  }

  return (
    <div className={styles.wrapper}>
      <Tooltip tooltip={gameStrings[stage.display_name]}>
        <Button
          className={styles.stage}
          color={isSelected ? undefined : "gray"}
          variant={isSelected ? "surface" : "soft"}
          radius="1"
          onClick={() => {
            // TODO: make minimum selectable upgrade the last free module for tanks like the destiny

            Tankopedia.mutate((draft) => {
              const tankData = tank.tank!;

              if (isAlternativeLine(lineName)) {
                const originalLine = originalLineName(lineName)!;

                draft.protagonist.alternates[originalLine] = true;
                draft.protagonist.upgrades[lineName] = index;
              } else {
                draft.protagonist.alternates[lineName] = false;
                draft.protagonist.upgrades[lineName] = index;
              }

              for (const required of stage.required_upgrades) {
                for (const line of tankData.upgrade_lines) {
                  let i = 0;

                  for (const candidateStage of line.stages) {
                    if (candidateStage.tech_name === required) {
                      draft.protagonist.upgrades[line.name] = Math.max(
                        draft.protagonist.upgrades[line.name],
                        i,
                      );
                    }

                    i++;
                  }
                }
              }

              for (const line of tankData.upgrade_lines) {
                if (draft.protagonist.alternates[line.name]) {
                  continue;
                }

                let i = draft.protagonist.upgrades[line.name];

                while (i > 0) {
                  const currentStage = line.stages[i];

                  const valid = currentStage.required_upgrades.every(
                    (required) => {
                      for (const otherLine of tankData.upgrade_lines) {
                        const idx = draft.protagonist.upgrades[otherLine.name];

                        if (otherLine.stages[idx]?.tech_name === required) {
                          return true;
                        }
                      }

                      return false;
                    },
                  );

                  if (valid) break;

                  i--;
                }

                draft.protagonist.upgrades[line.name] = i;
              }
            });
          }}
        >
          <img
            className={styles.icon}
            src={`/media/modules/${stage.stage_type}.webp`}
          />

          <Text weight="light" lowContrast size="minor" className={styles.tier}>
            {isAlternativeLine(lineName)
              ? strings.tanks.loadout.alternative
              : romanize(stage.number)}
          </Text>
        </Button>
      </Tooltip>

      {<Price className={styles.price} price={price} />}
    </div>
  );
}
