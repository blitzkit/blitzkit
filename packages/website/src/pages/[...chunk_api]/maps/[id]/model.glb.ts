import type { APIContext } from "astro";
import { mapModelBinary } from "../../../../core/maps/exporter";

export { getStaticPaths } from "./_index";

export async function GET({ props }: APIContext<{ id: number }>) {
  return new Response(await mapModelBinary(props.id));
}
