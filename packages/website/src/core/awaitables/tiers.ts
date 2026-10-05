import { times } from "lodash-es";
import { api } from "../blitzkit/api";

export const awaitableTiers = api.tankDefinitions().then((tankDefinitions) => {
  const maxTier = Math.max(
    ...Object.values(tankDefinitions.tanks).map((tank) => tank.tier),
  );

  return times(maxTier, (index) => maxTier - index);
});
