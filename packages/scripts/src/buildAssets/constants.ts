import { assertSecret } from "@blitzkit/core";
import { AbstractVFS } from "@blitzkit/core/src/blitzkit/vfs/abstract";
import { LocalVFS } from "@blitzkit/core/src/blitzkit/vfs/local";
import { MixedVFS } from "@blitzkit/core/src/blitzkit/vfs/mixed";
import { SteamVFS } from "@blitzkit/core/src/blitzkit/vfs/steam";
import { ZipVFS } from "@blitzkit/core/src/blitzkit/vfs/zip";

export const PATCHES_ROOT = "../../temp/patches";

const steamPattern = /steam:(\d+)\/(\d+)/;
const zipPattern = /zip:(.+)/;
const localePattern = /local:"?(.+)"?/;

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
    depot,
  ).init();
} else if (zipPattern.test(source)) {
  const [, url] = source.match(zipPattern)!;
  resolved = await new ZipVFS(url).init();
} else if (localePattern.test(source)) {
  const [, path] = source.match(localePattern)!;
  resolved = await new LocalVFS(path).init();
} else {
  throw new Error("No valid source specified");
}

resolved = new MixedVFS([new LocalVFS(PATCHES_ROOT), resolved]);

export const vfs = resolved;
