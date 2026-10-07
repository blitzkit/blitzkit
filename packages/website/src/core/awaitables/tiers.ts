import { times } from "lodash-es";
import { api } from "../blitzkit/api";

export const awaitableTiers = api.tankDefinitions().then((tankDefinitions) => {
  let max = 0;

  for (const tank of Object.values(tankDefinitions.tanks)) {
    if (tank.tier > max) max = tank.tier;
  }

  return times(max, (index) => max - index);
});
