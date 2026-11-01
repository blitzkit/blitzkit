import { api } from "../../../../core/blitzkit/api";
import { mixStaticPaths } from "../../../../core/blitzkit/mixStaticPaths";
import { getStaticPaths as _getStaticPaths } from "../../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const maps = await api.mapDefinitions();

  return Object.values(maps.maps)
    .filter((map) => map.model_id === map.id)
    .map((map) => ({
      params: { id: map.id },
      props: { id: map.id },
    }));
});
