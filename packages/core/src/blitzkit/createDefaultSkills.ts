import { SkillDefinitions } from "@blitzkit/protos";
import { permanentSkills } from "../blitz/permanentSkills";
import { MAX_SKILL_LEVEL } from "../config/skills";

export function createDefaultSkills(skillDefinitions: SkillDefinitions) {
  const skills: Record<string, number> = {};

  Object.values(skillDefinitions.classes).forEach((tankSkills) => {
    tankSkills.skills.forEach((skill) => {
      skills[skill] = permanentSkills.includes(skill) ? MAX_SKILL_LEVEL : 0;
    });
  });

  return skills;
}
