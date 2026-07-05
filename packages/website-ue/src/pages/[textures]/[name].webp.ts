import type { APIContext } from "astro";
import { mixStaticPaths } from "../../astro/mixStaticPaths";
import { game } from "../../game/game";
import { getStaticPaths as _getStaticPaths } from "./_index";
import { bufferProxy } from "../../api/bufferProxy";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, () => {
  return game!.textures.map((name) => ({ params: { name } }));
});

export function GET({ params }: APIContext<never, { name: string }>) {
  return bufferProxy(
    () => game!.texture(params.name),
    `texture-${params.name}`,
  );
}
