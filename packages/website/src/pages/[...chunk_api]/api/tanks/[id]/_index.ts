import { api } from "../../../../core/blitzkit/api";
import { mixStaticPaths } from "../../../../core/blitzkit/mixStaticPaths";
import { getStaticPaths as _getStaticPaths } from "../../../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const tanks = await api.tankDefinitions();

  return Object.values(tanks.tanks).map((tank) => ({
    params: { id: tank.id },
    props: { id: tank.id },
  }));
});
