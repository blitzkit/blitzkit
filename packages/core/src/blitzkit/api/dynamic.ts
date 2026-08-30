import { AbstractVFS, BlitzKitAPI } from "@blitzkit/core";

export async function createDynamicAPI(vfs: () => Promise<AbstractVFS>) {
  let _api: BlitzKitAPI;

  if (import.meta.env.SSR) {
    const { ServerBlitzKitAPI } = await import(
      "@blitzkit/core/src/blitzkit/api/server/index"
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
