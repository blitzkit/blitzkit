import {
  Nation,
  TankClass,
  TankType,
} from "@protos/blitz_static_tank_component";
import type { APIContext } from "astro";
import { mixStaticPaths } from "../../../astro/mixStaticPaths";
import { GunType } from "../../../tankopedia/characteristics";
import { getStaticPaths as _getStaticPaths } from "../_index";
import { GET as _GET } from "./all.json";

export const ENUMS = {
  nation: Nation,
  "tank-class": TankClass,
  "tank-type": TankType,
  "gun-type": GunType,
};

export const getStaticPaths = mixStaticPaths(_getStaticPaths, () => {
  return Object.keys(ENUMS).map((name) => ({ params: { enum: name } }));
});

export async function GET({
  params,
}: APIContext<never, { enum: keyof typeof ENUMS }>) {
  const enums = (await _GET().json()) as Record<string, Record<number, string>>;
  return Response.json(enums[params.enum]);
}
