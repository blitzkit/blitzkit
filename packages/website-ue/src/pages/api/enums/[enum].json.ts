import { TankClass, TankType } from "@blitzkit/core";
import { Nation } from "@protos/blitz_static_tank_component";
import type { APIContext, GetStaticPaths } from "astro";
import { GunType } from "../../../core/tankopedia/characteristics";
import { GET as _GET } from "./all.json";

export const ENUMS = {
  nation: Nation,
  "tank-class": TankClass,
  "tank-type": TankType,
  "gun-type": GunType,
};

export const getStaticPaths = (() => {
  return Object.keys(ENUMS).map((name) => ({ params: { enum: name } }));
}) satisfies GetStaticPaths;

export async function GET({
  params,
}: APIContext<never, { enum: keyof typeof ENUMS }>) {
  const enums = (await _GET().json()) as Record<string, Record<number, string>>;
  return Response.json(enums[params.enum]);
}
