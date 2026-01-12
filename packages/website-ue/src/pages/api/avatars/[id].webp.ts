import type { APIContext } from "astro";
import { api } from "../../../core/api/dynamic";
import { imageProxy } from "../../../core/api/imageProxy";

export { getStaticPaths } from "./[id].json";

export async function GET({ params }: APIContext<never, { id: string }>) {
  const avatar = await api.avatar(params.id);
  return await imageProxy(avatar.profile_avatar!.avatar);
}
