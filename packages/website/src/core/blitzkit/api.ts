import { type BlitzKitAPI } from "@blitzkit/core";
import { vfs } from "./vfs";

let _api: BlitzKitAPI;

if (import.meta.env.SSR) {
  const { ServerBlitzKitAPI } = await import("@blitzkit/core");
  _api = await new ServerBlitzKitAPI(vfs).init();
} else {
  const { ClientBlitzKitAPI } = await import("@blitzkit/core");
  _api = new ClientBlitzKitAPI();
}

export const api = _api;
