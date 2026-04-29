import type { UpgradeLine } from "@blitzkit/closed/protos/game/proto/legacy/blitz_static_tank_upgrade_line";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { api } from "../../core/api/dynamic";
import { useAwait } from "../../hooks/useAwait";
import { useStrings } from "../../hooks/useStrings";
import { Tankopedia } from "../../stores/tankopedia";
import { Heading } from "../Heading";
import { IconButton } from "../IconButton";
import { Section } from "../Section";
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
          <Line line={line} />
        ))}
      </div>
    </Section>
  );
}

interface LineProps {
  line: UpgradeLine;
}

function Line({ line }: LineProps) {
  const upgrades = Tankopedia.use((state) => state.protagonist.upgrades);
  const id = Tankopedia.use((state) => state.protagonist.id);
  const tank = useAwait(() => api.tank(id), `tank-${id}`);

  return (
    <div className={styles.line}>
      {line.stages.map((stage, index) => {
        const isSelected = upgrades[line.name] === index;

        return (
          <>
            {index !== 0 && <CaretDownIcon width="1em" height="1em" />}

            <IconButton
              variant={isSelected ? "solid" : "surface"}
              radius="1"
              className={styles.stage}
              onClick={() => {
                Tankopedia.mutate((draft) => {
                  draft.protagonist.upgrades[line.name] = index;

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
            </IconButton>
          </>
        );
      })}
    </div>
  );
}
