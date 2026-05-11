import type { UpgradeLine } from "@blitzkit/closed/protos/game/proto/legacy/blitz_static_tank_upgrade_line";
import { romanize } from "@blitzkit/core";
import { Fragment, useMemo } from "react";
import { api } from "../../core/api/dynamic";
import { useAwait } from "../../hooks/useAwait";
import { useStrings } from "../../hooks/useStrings";
import { Tankopedia } from "../../stores/tankopedia";
import { Heading } from "../Heading";
import { IconButton } from "../IconButton";
import { Section } from "../Section";
import { Text } from "../Text";
import styles from "./index.module.css";

export function TankopediaLoadout() {
  const strings = useStrings();

  const id = Tankopedia.use((state) => state.protagonist.id);
  const tank = useAwait(() => api.tank(id), `tank-${id}`);

  return (
    <Section>
      <Heading size="3">{strings.tanks.loadout.modules}</Heading>

      <div className={styles.lines}>
        {tank.tank!.upgrade_lines.map((line) => (
          <Line
            key={line.name}
            line={line.name}
            lines={tank.tank!.upgrade_lines}
          />
        ))}
      </div>
    </Section>
  );
}

interface LineProps {
  line: string;
  lines: UpgradeLine[];
}

const mergeLines = {
  alternative_guns: "guns",
} as Record<string, string>;

function Line({ line, lines }: LineProps) {
  const combinedLines = useMemo(() => {
    const lines: string[] = [line];

    for (const key in mergeLines) {
      if (mergeLines[key] === line) {
        lines.push(key);
      }
    }

    return lines;
  }, [line]);

  return (
    <div className={styles.line}>
      {!(line in mergeLines) &&
        combinedLines.map((line) => <LineInner line={line} lines={lines} />)}
    </div>
  );
}

function LineInner({ line, lines }: LineProps) {
  const id = Tankopedia.use((state) => state.protagonist.id);
  const upgrades = Tankopedia.use((state) => state.protagonist.upgrades);
  const tank = useAwait(() => api.tank(id), `tank-${id}`);

  const strings = useStrings();

  return lines
    .find((l) => l.name === line)!
    .stages.map((stage, index) => {
      const isSelected = upgrades[line] === index;

      return (
        <Fragment key={stage.tech_name}>
          <IconButton
            variant={isSelected ? "solid" : "surface"}
            radius="1"
            className={styles.stage}
            onClick={() => {
              Tankopedia.mutate((draft) => {
                draft.protagonist.upgrades[line] = index;

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
                    const valid = currentStage.required_upgrades.every(
                      (required) => {
                        for (const line of tank.tank!.upgrade_lines) {
                          const idx = draft.protagonist.upgrades[line.name];

                          if (line.stages[idx]?.tech_name === required) {
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
            <img src={`/api/tanks/modules/${stage.stage_type}.webp`} />
            {/* {stage.display_name} */}
            {/* {stage.grade} */}

            <Text lowContrast size="minor" className={styles.tier}>
              {line in mergeLines
                ? strings.tanks.loadout.alternative
                : romanize(stage.number)}
            </Text>
          </IconButton>
        </Fragment>
      );
    });
}
