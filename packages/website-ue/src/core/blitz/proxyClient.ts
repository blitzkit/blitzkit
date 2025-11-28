import { ProxyClient } from "@blitzkit/closed";

export const proxyClient = await new ProxyClient(
  import.meta.env.WOTB_SERVER
).handshake();

export const metadata = await proxyClient.metadata();
