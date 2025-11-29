import { assertSecret } from "@blitzkit/core";
import { AbstractVFS } from "../core/vfs/abstract";
import { SteamVFS } from "../core/vfs/steam";
import { ZipVFS } from "../core/vfs/zip";

const source = Bun.argv
  .find((arg) => arg.startsWith("--source="))
  ?.split("=")[1];

let resolved: AbstractVFS;

if (source === "steam") {
  const APP = 444200;
  const DEPOT = 444202;

  resolved = await new SteamVFS(
    assertSecret(import.meta.env.STEAM_USERNAME),
    assertSecret(import.meta.env.STEAM_PASSWORD),
    APP,
    DEPOT
  ).init();
} else if (source === "zip") {
  const url = assertSecret(import.meta.env.ZIP_URL);
  resolved = await new ZipVFS(url).init();
} else {
  throw new Error("No valid source specified");
}

export const vfs = resolved;
