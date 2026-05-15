import { romanize } from "@blitzkit/core";
import { Grade } from "@protos/game/proto/legacy/blitz_static_standard_grades_enum";
import type { StandardPrice } from "@protos/game/proto/legacy/blitz_static_standard_price";
import type { UpgradeLine } from "@protos/game/proto/legacy/blitz_static_tank_upgrade_line";
import type { StageParameters } from "@protos/game/proto/legacy/blitz_static_tank_upgrade_single_stage";
import { useMemo } from "react";
import {
  alternativeLines,
  isAlternativeLine,
} from "../../config/alternativeLines";
import { useProtagonist } from "../../hooks/useProtagonist";
import { useStrings } from "../../hooks/useStrings";
import { useUpgradePreset } from "../../hooks/useUpgradePreset";
import { Tankopedia } from "../../stores/tankopedia";
import { Button } from "../Button";
import { Heading } from "../Heading";
import { Price } from "../Price";
import { Section } from "../Section";
import { Text } from "../Text";
import styles from "./index.module.css";

export function TankopediaLoadout() {
  const strings = useStrings();

  const tank = useProtagonist();

  return (
    <Section>
      <Heading size="3">{strings.tanks.loadout.modules}</Heading>

      <div className={styles.lines}>
        {tank.tank!.upgrade_lines.map((line) => (
          <Line
            key={line.name}
            name={line.name}
            lines={tank.tank!.upgrade_lines}
          />
        ))}
      </div>
    </Section>
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

  const isSelected = upgrades[lineName] === index;

  return (
    <Button
      color={isSelected ? undefined : "gray"}
      variant={isSelected ? "surface" : "soft"}
      radius="1"
      className={styles.stage}
      onClick={() => {
        Tankopedia.mutate((draft) => {
          draft.protagonist.upgrades[lineName] = index;

          for (const required of stage.required_upgrades) {
            for (const line of tank.tank!.upgrade_lines) {
              let i = 0;

              for (const stage of line.stages) {
                if (stage.tech_name === required) {
                  draft.protagonist.upgrades[line.name] = Math.max(
                    draft.protagonist.upgrades[line.name],
                    i,
                  );
                }

                i++;
              }
            }
          }

          for (const line of tank.tank!.upgrade_lines) {
            let i = draft.protagonist.upgrades[line.name];

            while (i > 0) {
              const currentStage = line.stages[i];
              const valid = currentStage.required_upgrades.every((required) => {
                for (const line of tank.tank!.upgrade_lines) {
                  const idx = draft.protagonist.upgrades[line.name];

                  if (line.stages[idx]?.tech_name === required) {
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

      <Text lowContrast size="minor" className={styles.tier}>
        {isAlternativeLine(lineName)
          ? strings.tanks.loadout.alternative
          : romanize(stage.number)}
      </Text>

      {price && <Price className={styles.price} price={price} />}
    </Button>
  );
}
