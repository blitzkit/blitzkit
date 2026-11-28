import { AbstractBlitzKitAPI } from "@blitzkit/core";
import type { AbstractVFS } from "@blitzkit/vfs";

export async function createDynamicAPI(vfs: () => Promise<AbstractVFS>) {
  let _api: AbstractBlitzKitAPI;

  if (import.meta.env.SSR) {
    const { ServerBlitzKitAPI } = await import(
      "@blitzkit/core/src/blitzkit/api/server"
    );

    _api = await new ServerBlitzKitAPI(await vfs()).init();
  } else {
    const { ClientBlitzKitAPI } = await import(
      "@blitzkit/core/src/blitzkit/api/client"
    );

    _api = new ClientBlitzKitAPI();
  }

  return _api;
}
