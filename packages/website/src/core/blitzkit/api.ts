import type { BlitzKitAPI } from "@blitzkit/core/src/blitzkit/api/base";

let _api: BlitzKitAPI;

if (import.meta.env.SSR) {
  const { ServerBlitzKitAPI } = await import(
    "@blitzkit/core/src/blitzkit/api/server"
  );
  const { vfs } = await import("./vfs");

  _api = await new ServerBlitzKitAPI(vfs).init();
} else {
  const { ClientBlitzKitAPI } = await import(
    "@blitzkit/core/src/blitzkit/api/client"
  );

  _api = new ClientBlitzKitAPI();
}

export const api = _api;
