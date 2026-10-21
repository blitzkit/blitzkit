export type ShellDefinitionsList = Record<
  string,
  {
    id: number;
    userString: string;
    icon: string;
    kind: ShellKind;
    caliber: number;
    damage: { armor: number; devices: number };
    normalizationAngle?: number;
    ricochetAngle?: number;
    explosionRadius?: number;
    speed: number;
    maxDistance?: number;
    piercingPower: string;
  }
> & {
  icons: Record<string, string>;
};

export type ShellKind =
  | "ARMOR_PIERCING"
  | "ARMOR_PIERCING_CR"
  | "HIGH_EXPLOSIVE"
  | "HOLLOW_CHARGE";
