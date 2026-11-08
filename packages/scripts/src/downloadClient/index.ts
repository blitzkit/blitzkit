import { assertSecret } from "@blitzkit/core";
import { mkdir, rm } from "node:fs/promises";
import { downloadSteamClient } from "./steam";
import { downloadWGPKGClient } from "./wgpkg";
import { downloadZipClient } from "./zip";

export const DEPOT_DOWNLOADER_RETRY_TIME = 30_000;

const provider = assertSecret(import.meta.env.CLIENT_PROVIDER);
export const source = assertSecret(import.meta.env.CLIENT_SOURCE);
export const dir = assertSecret(import.meta.env.CLIENT_DIR);

await rm(dir, { recursive: true, force: true });
await mkdir(dir, { recursive: true });

switch (provider) {
  case "steam":
    await downloadSteamClient();
    break;

  case "zip":
    await downloadZipClient();
    break;

  case "wgpkg":
    await downloadWGPKGClient();
    break;

  default:
    throw new Error(`Unknown provider: ${provider}`);
}
