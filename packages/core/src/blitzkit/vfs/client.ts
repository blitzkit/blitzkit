import { assertSecret } from "@blitzkit/core";
import { LocalVFS } from "./local";
import { MixedVFS } from "./mixed";
import { ZipVFS } from "./zip";

// zip reads straight from the remote archive; CLIENT_DIR stays first so SmartDLC patches override it
export function createClientVFS() {
  const local = new LocalVFS(assertSecret(import.meta.env.CLIENT_DIR));

  if (import.meta.env.CLIENT_PROVIDER === "zip") {
    return new MixedVFS([
      local,
      new ZipVFS(assertSecret(import.meta.env.CLIENT_SOURCE)),
    ]);
  }

  return local;
}
