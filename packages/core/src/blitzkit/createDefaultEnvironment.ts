import { SkillDefinitions } from "@blitzkit/protos";
import { createDefaultSkills } from "./createDefaultSkills";
import { TankEnvironment } from "./tankEnvironment";

export function createDefaultEnvironment(skills: SkillDefinitions) {
  return {
    equalize: false,
    distance: 0,
    skills: createDefaultSkills(skills),
  } satisfies TankEnvironment;
}
