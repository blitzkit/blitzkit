import { times } from "lodash-es";
import { api } from "../../api/dynamic";

export const awaitableTiers = api.tanks().then((tankDefinitions) => {
  let max = 0;

  for (const tank of Object.values(tankDefinitions.tanks)) {
    if (tank.tier > max) max = tank.tier;
  }

  return times(max, (index) => max - index);
});
