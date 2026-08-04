import { BlitzTankClass, SkillDefinitions, TankClass } from "@blitzkit/core";

import { Cache } from "@blitzkit/core/src/blitzkit/api/server/0";
import { ServerBlitzKitAPI7 } from "@blitzkit/core/src/blitzkit/api/server/7";

export abstract class ServerBlitzKitAPI8 extends ServerBlitzKitAPI7 {
  @Cache()
  async skillDefinitions() {
    const skillDefinitions = SkillDefinitions.create();

    for (const tankClass in this.tankmenAvatar!.root.skillsByClasses) {
      const skills =
        this.tankmenAvatar!.root.skillsByClasses[
          Number(tankClass) as TankClass
        ];

      skillDefinitions.classes[
        this.blitzTankClassToBlitzkit[tankClass as BlitzTankClass]
      ] = { skills: skills.split(" ") };
    }

    return skillDefinitions;
  }
}
