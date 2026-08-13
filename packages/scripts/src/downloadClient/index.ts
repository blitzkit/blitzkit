import { assertSecret } from "@blitzkit/core";
import { $ } from "bun";
import { mkdir, rm } from "node:fs/promises";
import {
  DEPOT_DOWNLOADER_EXECUTABLE,
  DEPOT_DOWNLOADER_MAX_DOWNLOADS,
  DEPOT_DOWNLOADER_OUTPUT,
} from "./constants";
import { QuickGitHubRelease } from "./types";

const provider = assertSecret(import.meta.env.CLIENT_PROVIDER);
const source = assertSecret(import.meta.env.CLIENT_SOURCE);
const dir = assertSecret(import.meta.env.CLIENT_DIR);

await rm(dir, { recursive: true, force: true });

if (provider === "steam") {
  const [id, platform] = source.split("/");

  console.log("Downloading Depot Downloader...");

  const releases = await fetch(
    "https://api.github.com/repos/SteamRE/DepotDownloader/releases/latest",
  ).then((response) => response.json() as Promise<QuickGitHubRelease>);
  const asset = releases.assets.find((asset) =>
    asset.name.includes("linux-x64"),
  );

  if (!asset) {
    throw new Error("No linux-x64 asset found for Steam DepotDownloader");
  }

  await rm(DEPOT_DOWNLOADER_OUTPUT, { recursive: true, force: true });

  await $`curl -L "${asset.browser_download_url}" -o "${DEPOT_DOWNLOADER_OUTPUT}.zip"`;
  await $`unzip "${DEPOT_DOWNLOADER_OUTPUT}.zip" -d "${DEPOT_DOWNLOADER_OUTPUT}"`;
  await $`chmod +x "${DEPOT_DOWNLOADER_EXECUTABLE}"`;

  console.log("Downloading client...");

  const username = assertSecret(import.meta.env.STEAM_USERNAME);
  const password = assertSecret(import.meta.env.STEAM_PASSWORD);

  await $`${DEPOT_DOWNLOADER_EXECUTABLE} -os ${
    platform
  } -app ${id} -username ${username} -password ${
    password
  } -dir ${dir} -max-downloads ${DEPOT_DOWNLOADER_MAX_DOWNLOADS}`;
} else if (provider === "zip") {
  const url = assertSecret(import.meta.env.CLIENT_SOURCE);

  await mkdir(dir, { recursive: true });

  await $`curl -L "${url}" | bsdtar -xf- --strip-components=1 -C ${dir}`;
} else {
  throw new Error(`Unknown provider: ${provider}`);
}
