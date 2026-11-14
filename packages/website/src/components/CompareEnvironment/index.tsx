import { MAX_SKILL_LEVEL, permanentSkills } from "@blitzkit/core";
import { api } from "../../api/dynamic";
import { useStrings } from "../../hooks/useStrings";
import { CompareEphemeral } from "../../stores/compareEphemeral";
import { Checkbox } from "../Checkbox";
import { IconButton } from "../IconButton";
import { LoadoutSkills } from "../LoadoutSkills";
import { Popover } from "../Popover";
import styles from "./index.module.css";

const skills = await api.skills();

export function CompareEnvironment() {
  const strings = useStrings();
  const selected = CompareEphemeral.use((state) => state.environment.skills);
  const equalize = CompareEphemeral.use((state) => state.environment.equalize);

  return (
    <div className={styles.wrapper}>
      <Popover.Root>
        <Popover.Trigger asChild>
          <IconButton variant="ghost" className={styles.trigger}>
            <div className={styles.dots}>
              {Object.entries(skills.classes).map(([tankClass, group]) => (
                <div key={tankClass} className={styles["dot-row"]}>
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className={styles.dot}
                      data-state={
                        selected[skill] === 0
                          ? "none"
                          : permanentSkills.includes(skill)
                          ? "permanent"
                          : "temporary"
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          </IconButton>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content>
            <LoadoutSkills
              selected={selected}
              onChange={(skill, level) => {
                CompareEphemeral.mutate((draft) => {
                  draft.environment.skills[skill] = level;
                });
              }}
              onClear={() => {
                CompareEphemeral.mutate((draft) => {
                  for (const skill in draft.environment.skills) {
                    draft.environment.skills[skill] = 0;
                  }
                });
              }}
              onMaximize={() => {
                CompareEphemeral.mutate((draft) => {
                  for (const skill in draft.environment.skills) {
                    draft.environment.skills[skill] = MAX_SKILL_LEVEL;
                  }
                });
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <Checkbox
        checked={equalize}
        onCheckedChange={(checked) => {
          CompareEphemeral.mutate((draft) => {
            draft.environment.equalize = checked;
          });
        }}
      >
        {strings.compare.equalize}
      </Checkbox>
    </div>
  );
}
