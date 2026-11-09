import { assertSecret } from "@blitzkit/core";
import { mkdir, rm } from "node:fs/promises";
import { downloadSteamClient } from "./steam";
import { downloadWGCClient } from "./wgc";
import { downloadWGPKGClient } from "./wgpkg";
import { downloadZipClient } from "./zip";

export const DEPOT_DOWNLOADER_RETRY_TIME = 30_000;

const provider = import.meta.env.CLIENT_PROVIDER;
export const source = import.meta.env.CLIENT_SOURCE;
export const dir = assertSecret(import.meta.env.CLIENT_DIR);

await rm(dir, { recursive: true, force: true });
await mkdir(dir, { recursive: true });

switch (provider) {
  // steam, identical to wgc
  case "steam":
    await downloadSteamClient();
    break;

  // from zip, usually has a root directory for opentest
  case "zip":
    await downloadZipClient();
    break;

  // effectively the same as wgc, but direct for preview
  case "wgpkg":
    await downloadWGPKGClient();
    break;

  default:
    console.log("Unknown client provider specified, using latest wgc client");
  case "wgc":
    await downloadWGCClient();
    break;
}
