import { TankDefinition } from "@blitzkit/core";
import { sumBy } from "lodash-es";
import { useMemo } from "react";
import { api } from "../blitzkit/api";
import { Duel } from "../stores/duel";

export enum UseEccentricityMode {
  Tier,
  Class,
}

const tankDefinitions = await api.tanks();

export function useEccentricity(mode: UseEccentricityMode) {
  const tank = Duel.use((state) => state.protagonist.tank);
  const similarTanks = useMemo(
    () =>
      Object.values(tankDefinitions).filter(
        (tankB) =>
          tank.tier === tankB.tier &&
          (mode === UseEccentricityMode.Class
            ? tank.class === tankB.class
            : true),
      ),
    [tank.id],
  );

  function eccentricity(property: (tank: TankDefinition) => number) {
    const average = sumBy(similarTanks, property) / similarTanks.length;
    return property(tank) / average;
  }

  return eccentricity;
}
