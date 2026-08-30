import { api } from "../../../../blitzkit/api";
import { mixStaticPaths } from "../../../../astro/mixStaticPaths";
import { getStaticPaths as _getStaticPaths } from "../../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const tanks = await api.tanks();

  return Object.values(tanks.tanks).map((tank) => ({
    params: { id: tank.id },
    props: { id: tank.id },
  }));
});
