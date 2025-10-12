import { NATION_IDS } from "./nations";

export function toUniqueId(nation: string, id: number) {
  return (id << 8) + (NATION_IDS[nation] << 4) + 1;
}
