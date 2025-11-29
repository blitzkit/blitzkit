import { assertSecret } from "@blitzkit/core";
import { SteamVFS } from "../core/vfs/vfs";

const APP = 444200;
const DEPOT = 444202;

export const vfs = await new SteamVFS(
  assertSecret(import.meta.env.STEAM_USERNAME),
  assertSecret(import.meta.env.STEAM_PASSWORD),
  APP,
  DEPOT
).init();
