import { TankClass } from "@blitzkit/core";

export interface TankmenAvatar {
  roles: unknown;
  skillsByClasses: Record<TankClass, string>;
  skills: {
    [name: string]: {
      userString: string;
      effectDescription: string;
      tipDescription: string;
      icon: SkillIcon | SkillIcon[];
      type: "continuous" | "trigger";
    };
  };
}

interface SkillIcon {
  name: string;
  state: number;
}
