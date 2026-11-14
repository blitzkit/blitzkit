import { assertSecret } from "@blitzkit/core";
import { AbstractVFS } from "./abstract";
import { LocalVFS } from "./local";
import { ZipVFS } from "./zip";

export async function createClientVFS() {
  let vfs: AbstractVFS;

  if (import.meta.env.CLIENT_PROVIDER === "zip") {
    vfs = new ZipVFS(assertSecret(import.meta.env.CLIENT_SOURCE));
  } else {
    vfs = new LocalVFS(assertSecret(import.meta.env.CLIENT_DIR));
  }

  await vfs.init();

  return vfs;
}
