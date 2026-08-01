export type BlitzModuleType = {
  [key in "vehicle" | "engine" | "chassis" | "turret" | "gun"]:
    | UnlocksInner
    | UnlocksInner[];
};

interface UnlocksInner {
  cost: number | string;
  "#text": number;
}
