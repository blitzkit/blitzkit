import { api } from "../../../api/dynamic";
import { imageProxy } from "../../../api/imageProxy";
import { mixStaticPaths } from "../../../astro/mixStaticPaths";
import { getStaticPaths as _getStaticPaths } from "../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const group = api.metadata.group("CurrencyEntity");
  return group.map(({ id }) => ({ params: { id } }));
});

export async function GET({ params }: { params: { id: string } }) {
  const icon = await api.currencyIcon(params.id);
  return await imageProxy(icon);
}
