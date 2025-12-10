import { assertSecret } from "@blitzkit/core";
import { AbstractVFS } from "../core/vfs/abstract";
import { SteamVFS } from "../core/vfs/steam";
import { ZipVFS } from "../core/vfs/zip";

const steamPattern = /steam:(\d+)\/(\d+)/;
const zipPattern = /zip:(.+)/;

const source = Bun.argv
  .find((arg) => arg.startsWith("--source="))
  ?.split("=")[1];

let resolved: AbstractVFS;

if (!source) {
  throw new Error("No source specified");
} else if (steamPattern.test(source)) {
  const [, app, depot] = source.match(steamPattern)!.map(Number);

  resolved = await new SteamVFS(
    assertSecret(import.meta.env.STEAM_USERNAME),
    assertSecret(import.meta.env.STEAM_PASSWORD),
    app,
    depot
  ).init();
} else if (zipPattern.test(source)) {
  const [, url] = source.match(zipPattern)!;
  resolved = await new ZipVFS(url).init();
} else {
  throw new Error("No valid source specified");
}

export const vfs = resolved;
