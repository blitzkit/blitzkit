import {
  ClientBlitzKitAPI,
  ServerBlitzKitAPI,
  type BlitzKitAPI,
} from "@blitzkit/core";

let _api: BlitzKitAPI;

if (import.meta.env.SSR) {
  _api = await new ServerBlitzKitAPI(vfs).init();
} else {
  _api = new ClientBlitzKitAPI();
}

export const api = _api;
