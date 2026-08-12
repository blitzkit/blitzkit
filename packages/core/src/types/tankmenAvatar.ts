export interface TankmenAvatar {
  roles: unknown;
  skillsByClasses: Record<string, string>;
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
