import { assertSecret } from "@blitzkit/core";
import { LocalVFS } from "@blitzkit/core/src/blitzkit/vfs/local";

export const vfs = await new LocalVFS(
  assertSecret(import.meta.env.CLIENT_DIR),
).init();
