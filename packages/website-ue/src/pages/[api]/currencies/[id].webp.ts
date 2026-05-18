import type { GetStaticPaths } from "astro";
import { api } from "../../../api/dynamic";
import { imageProxy } from "../../../api/imageProxy";

export const getStaticPaths = (async () => {
  const group = api.metadata.group("CurrencyEntity");
  return group.map(({ name }) => ({ params: { id: name } }));
}) satisfies GetStaticPaths;

export async function GET({ params }: { params: { id: string } }) {
  const icon = await api.currencyIcon(params.id);
  return await imageProxy(icon);
}
