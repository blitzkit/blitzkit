import { assertSecret } from "@blitzkit/core";
import { fetchWGCClientSource } from "./fetchWGCClientSource";
import { AbstractVFS } from "./abstract";
import { LocalVFS } from "./local";
import { MixedVFS } from "./mixed";
import { SevenZipVFS } from "./sevenZip";
import { ZipVFS } from "./zip";

export async function createClientVFS() {
  const provider = import.meta.env.CLIENT_PROVIDER;
  let vfs: AbstractVFS;

  if (provider === "zip") {
    vfs = new ZipVFS(assertSecret(import.meta.env.CLIENT_SOURCE));
  } else if (provider === "7z") {
    vfs = new SevenZipVFS(assertSecret(import.meta.env.CLIENT_SOURCE));
  } else if (provider === "wgc") {
    vfs = new SevenZipVFS(await fetchWGCClientSource());
  } else if (provider === "local") {
    vfs = new LocalVFS(assertSecret(import.meta.env.CLIENT_DIR));
  } else {
    throw new Error(`Unknown client provider: ${provider}`);
  }

  // smart dlc patches take precedence over the client
  const smartDlcDir = import.meta.env.SMART_DLC_DIR;

  if (smartDlcDir) {
    vfs = new MixedVFS([new LocalVFS(smartDlcDir), vfs]);
  }

  return await vfs.init();
}
