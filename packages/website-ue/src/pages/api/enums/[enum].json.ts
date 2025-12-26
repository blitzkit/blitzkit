import { Nation } from "@protos/blitz_static_tank_component";
import type { APIContext, GetStaticPaths } from "astro";

const enums = {
  nation: Nation,
};

export const getStaticPaths = (() => {
  return Object.keys(enums).map((name) => ({ params: { enum: name } }));
}) satisfies GetStaticPaths;

/**
 * The one who wipes, swipes.
 */
export function GET({
  params,
}: APIContext<never, { enum: keyof typeof enums }>) {
  const map: Record<number, string> = {};

  for (const key in enums[params.enum]) {
    const value = enums[params.enum][key];
    if (typeof value !== "string") continue;
    map[key] = value;
  }

  return Response.json(map);
}
