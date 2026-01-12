import type { APIContext } from "astro";
import { api } from "../../../core/api/dynamic";
import { imageProxy } from "../../../core/api/imageProxy";

export { getStaticPaths } from "./[id].json";

export async function GET({ params }: APIContext<never, { id: string }>) {
  const background = await api.background(params.id);
  return await imageProxy(background.profile_background!.background);
}
