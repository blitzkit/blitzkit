import { assertSecret } from "@blitzkit/core";
import type { AbstractAPI } from "./abstract";

let dynamicAPI: AbstractAPI;

if (typeof window === "undefined") {
  const { ProxyClient } = await import("@blitzkit/closed");
  const { ServerAPI } = await import("./server");

  const proxyClient = await new ProxyClient(
    assertSecret(import.meta.env.WOTB_SERVER),
  ).handshake(assertSecret(import.meta.env.WOTB_VERSION));
  const metadata = await proxyClient.metadata();

  dynamicAPI = new ServerAPI(metadata);
} else {
  const { ClientAPI } = await import("./client");

  dynamicAPI = new ClientAPI();
}

export const api = dynamicAPI;
