import { assertSecret, SteamVFS } from "@blitzkit/core";

const APP = 444200;
const DEPOT = 444202;

export const vfs = new SteamVFS(
  assertSecret(import.meta.env.STEAM_USERNAME),
  assertSecret(import.meta.env.STEAM_PASSWORD),
  APP,
  DEPOT
);
