import type { CharacteristicsGroup } from "../types/characteristics";

export const characteristicsGroups: CharacteristicsGroup[] = [
  {
    name: "firepower",
    order: [
      {
        name: "gun_type",
      },
      {
        name: "damage",
      },
      {
        name: "clip_size",
      },
    ],
  },
];
