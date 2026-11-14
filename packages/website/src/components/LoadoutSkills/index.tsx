import {
  alias,
  MAX_SKILL_LEVEL,
  permanentSkills,
  romanize,
} from "@blitzkit/core";
import { DoubleArrowUpIcon, TrashIcon } from "@radix-ui/react-icons";
import { api } from "../../api/dynamic";
import { useStrings } from "../../hooks/useStrings";
import { Discriminator } from "../Discriminator";
import { IconButton } from "../IconButton";
import { LoadoutSection } from "../LoadoutSection";
import styles from "./index.module.css";

const skills = await api.skills();

interface ContentProps {
  selected: Record<string, number>;
  onChange: (skill: string, level: number) => void;
}

function Content({ selected, onChange }: ContentProps) {
  return (
    <div className={styles.skills}>
      {Object.entries(skills.classes).map(([tankClass, group]) => (
        <div key={tankClass} className={styles.row}>
          {group.skills.map((skill) => {
            const level = selected[skill];

            return (
              <IconButton
                key={skill}
                size="major"
                radius="1"
                className={styles.skill}
                color={
                  level === 0
                    ? "gray"
                    : permanentSkills.includes(skill)
                    ? undefined
                    : "amber"
                }
                variant={level === 0 ? "soft" : "surface"}
                onClick={(event) => {
                  if (event.shiftKey) {
                    onChange(skill, level === 0 ? MAX_SKILL_LEVEL : 0);
                  } else {
                    onChange(skill, level === 0 ? MAX_SKILL_LEVEL : level - 1);
                  }
                }}
              >
                <img src={alias("api", `/icons/skills/${skill}.webp`)} />
                {level > 0 && (
                  <Discriminator inset="small">{romanize(level)}</Discriminator>
                )}
              </IconButton>
            );
          })}
        </div>
      ))}
    </div>
  );
}

interface LoadoutSkillsProps {
  selected: Record<string, number>;
  onChange: (skill: string, level: number) => void;
  onClear: () => void;
  onMaximize: () => void;
}

export function LoadoutSkills({
  selected,
  onChange,
  onClear,
  onMaximize,
}: LoadoutSkillsProps) {
  const strings = useStrings();

  return (
    <LoadoutSection
      title={strings.tanks.loadout.skills}
      actions={
        <>
          <IconButton
            color="red"
            variant="ghost"
            size="minor"
            onClick={onClear}
          >
            <TrashIcon />
          </IconButton>

          <IconButton
            highContrast
            color="gray"
            size="minor"
            variant="ghost"
            onClick={onMaximize}
          >
            <DoubleArrowUpIcon />
          </IconButton>
        </>
      }
    >
      <Content selected={selected} onChange={onChange} />
    </LoadoutSection>
  );
}
