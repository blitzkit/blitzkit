import {
  ClientBlitzKitAPI,
  ServerBlitzKitAPI,
  type BlitzKitAPI,
} from "@blitzkit/core";

let _api: BlitzKitAPI;

if (import.meta.env.SSR) {
  _api = new ServerBlitzKitAPI();
} else {
  _api = new ClientBlitzKitAPI();
}

export const api = _api;
