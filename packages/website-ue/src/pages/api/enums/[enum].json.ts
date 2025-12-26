import { TankClass, TankType } from "@blitzkit/core";
import { Nation } from "@protos/blitz_static_tank_component";
import type { APIContext, GetStaticPaths } from "astro";
import { GunType } from "../../../core/tankopedia/characteristics";

const enums = {
  nation: Nation,
  "tank-class": TankClass,
  "tank-type": TankType,
  "gun-type": GunType,
};

export const getStaticPaths = (() => {
  return Object.keys(enums).map((name) => ({ params: { enum: name } }));
}) satisfies GetStaticPaths;

/**
 * Enumerations used within BlitzKit, for nominal development reference only.
 *
 * DO NOT programmatically use this API as it is designed solely for human
 * reference.
 *
 * DO NOT blindly copy entries as naming conventions vary. Most enums come
 * directly from the game which uses a SCREAMING_SNAKE_CASE convention while
 * BlitzKit uses PascalCase.
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
