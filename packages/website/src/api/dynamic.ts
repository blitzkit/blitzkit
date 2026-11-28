import { createDynamicAPI } from "@blitzkit/core";

export const api = await createDynamicAPI(async () => {
  // rollup prunes imports in dead if branches, but not ones after an early throw
  if (import.meta.env.SSR) {
    const { vfs } = await import("../core/blitzkit/vfs");

    return vfs;
  }

  throw new Error("VFS is server-only");
});
