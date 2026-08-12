import { BlitzTankClass, SkillDefinitions } from "@blitzkit/core";

import { Cache } from "./0_base";
import { ServerBlitzKitAPI7 } from "./7_provisionDefinitions";

export abstract class ServerBlitzKitAPI8 extends ServerBlitzKitAPI7 {
  @Cache()
  async skillDefinitions() {
    const skillDefinitions = SkillDefinitions.create();

    for (const tankClass in this.tankmenAvatar!.root.skillsByClasses) {
      const skills = this.tankmenAvatar!.root.skillsByClasses[tankClass];

      skillDefinitions.classes[
        this.blitzTankClassToBlitzkit[tankClass as BlitzTankClass]
      ] = { skills: skills.split(" ") };
    }

    return skillDefinitions;
  }
}
