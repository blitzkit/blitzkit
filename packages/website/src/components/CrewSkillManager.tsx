import { permanentSkills, romanize } from "@blitzkit/core";
import { Flex } from "@radix-ui/themes";
import { api } from "../core/blitzkit/api";
import { GenericTankComponentButton } from "./ModuleButtons/GenericTankComponentButton";

interface CrewSkillManagerProps {
  skillLevels: Record<string, number>;
  onChange?: (skillLevels: Record<string, number>) => void;
}

const skillDefinitions = await api.skillDefinitions();

export function CrewSkillManager({
  skillLevels,
  onChange,
}: CrewSkillManagerProps) {
  return (
    <Flex direction="column" gap="2">
      {Object.entries(skillDefinitions.classes).map(([tankClass, skills]) => (
        <Flex gap="2" key={tankClass}>
          {skills.skills.map((skill) => {
            const level = skillLevels[skill];

            return (
              <GenericTankComponentButton
                key={skill}
                special={!permanentSkills.includes(skill)}
                selected={level > 0}
                discriminator={level === 0 ? undefined : romanize(level)}
                icon={`/api/icons/skills/${skill}.webp`}
                onClick={(event) => {
                  if (!onChange) return;

                  const draft = { ...skillLevels };

                  if (event.shiftKey) {
                    draft[skill] = draft[skill] === 0 ? 7 : 0;
                  } else {
                    draft[skill] = level - 1;
                    if (draft[skill] < 0) draft[skill] = 7;
                  }

                  onChange(draft);
                }}
              />
            );
          })}
        </Flex>
      ))}
    </Flex>
  );
}
