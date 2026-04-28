import { deburr } from "lodash-es";
import { api } from "../core/api/dynamic";
import { useAwait } from "./useAwait";
import { useGameStrings } from "./useGameStrings";

export function useSearchableTanks() {
  const gameStrings = useGameStrings("TankEntity");
  const tanks = useAwait(() => api.tanks(), "tanks");

  return Object.values(tanks.tanks).map((tank) => {
    const { id } = tank;
    const name = gameStrings[tank.tank!.name!.value];
    const deburred = deburr(name);

    return { id, name, deburred };
  });
}
