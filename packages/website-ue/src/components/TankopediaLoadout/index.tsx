import { romanize } from "@blitzkit/core";
import { Grade } from "@protos/blitz_static_standard_grades_enum";
import type { StandardPrice } from "@protos/blitz_static_standard_price";
import type { UpgradeLine } from "@protos/blitz_static_tank_upgrade_line";
import type { StageParameters } from "@protos/blitz_static_tank_upgrade_single_stage";
import { DoubleArrowDownIcon, DoubleArrowUpIcon } from "@radix-ui/react-icons";
import { useMemo } from "react";
import {
  alternativeLines,
  isAlternativeLine,
  originalLineName,
} from "../../config/alternativeLines";
import { useProtagonist } from "../../hooks/useProtagonist";
import { useStrings } from "../../hooks/useStrings";
import { useUpgradePreset } from "../../hooks/useUpgradePreset";
import { Tankopedia } from "../../stores/tankopedia";
import { Button } from "../Button";
import { Heading } from "../Heading";
import { IconButton } from "../IconButton";
import { Price } from "../Price";
import { Section } from "../Section";
import { Text } from "../Text";
import styles from "./index.module.css";

export function TankopediaLoadout() {
  return (
    <Section>
      <Modules />
      <Equipment />
    </Section>
  );
}

function Equipment() {
  const strings = useStrings();
  const tank = useProtagonist();
  // const equipment = useEquipment(
  //   tank.tank!.equipment_preset_catalog_id,
  //   tank.tank!.equipment_price_preset_catalog_id,
  // );

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <Heading size="4">{strings.tanks.loadout.equipment}</Heading>
      </div>
      preset: {tank.tank!.equipment_preset_catalog_id}
      <br />
      price: {tank.tank!.equipment_price_preset_catalog_id}
    </div>
  );
}

function Modules() {
  const strings = useStrings();
  const tank = useProtagonist();

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <Heading size="4">{strings.tanks.loadout.modules}</Heading>

        <IconButton
          onClick={() => {
            Tankopedia.mutate((draft) => {
              for (const line of tank.tank!.upgrade_lines) {
                if (isAlternativeLine(line.name)) continue;

                draft.protagonist.upgrades[line.name] = 0;
                draft.protagonist.alternates[line.name] = false;
              }
            });
          }}
          color="tomato"
          variant="ghost"
        >
          <DoubleArrowDownIcon />
        </IconButton>

        <IconButton
          onClick={() => {
            Tankopedia.mutate((draft) => {
              for (const line of tank.tank!.upgrade_lines) {
                draft.protagonist.upgrades[line.name] = line.stages.length - 1;

                if (isAlternativeLine(line.name)) {
                  const original = originalLineName(line.name)!;
                  draft.protagonist.alternates[original] = true;
                }
              }
            });
          }}
          color="jade"
          variant="ghost"
        >
          <DoubleArrowUpIcon />
        </IconButton>
      </div>

      <div className={styles.lines}>
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
          <LineInner key={name} name={name} lines={lines} />
        ))}
    </div>
  );
}

function LineInner({ name, lines }: LineProps) {
  const line = lines.find((line) => line.name === name)!;

  return line.stages.map((stage, index) => (
    <LineElement key={index} index={index} lineName={name} stage={stage} />
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
    <Button
      color={isSelected ? undefined : "gray"}
      variant={isSelected ? "surface" : "soft"}
      radius="1"
      className={styles.stage}
      onClick={() => {
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

              const valid = currentStage.required_upgrades.every((required) => {
                for (const otherLine of tankData.upgrade_lines) {
                  const idx = draft.protagonist.upgrades[otherLine.name];

                  if (otherLine.stages[idx]?.tech_name === required) {
                    return true;
                  }
                }

                return false;
              });

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
        src={`/api/tanks/modules/${stage.stage_type}.webp`}
      />
      {/* {stage.display_name} */}

      <Text weight="light" lowContrast size="minor" className={styles.tier}>
        {isAlternativeLine(lineName)
          ? strings.tanks.loadout.alternative
          : romanize(stage.number)}
      </Text>

      {price && <Price className={styles.price} price={price} />}
    </Button>
  );
}
