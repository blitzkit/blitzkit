import {
  ClientBlitzKitAPI,
  LocalVFS,
  ServerBlitzKitAPI,
  type BlitzKitAPI,
} from "@blitzkit/core";

let _api: BlitzKitAPI;

if (import.meta.env.SSR) {
  const vfs = new LocalVFS(
    "/run/media/tresabhi/Windows/Program Files/WindowsApps/7458BE2C.WorldofTanksBlitz_11.19.272.0_x64__x4tje2y229k00",
  );

  _api = await new ServerBlitzKitAPI(vfs).init();
} else {
  _api = new ClientBlitzKitAPI();
}

export const api = _api;
