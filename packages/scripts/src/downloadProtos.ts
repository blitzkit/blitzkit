import { ProxyClient } from "@blitzkit/closed";
import { assertSecret } from "@blitzkit/core";

const proxyClient = await new ProxyClient(
  assertSecret(import.meta.env.WOTB_SERVER),
).handshake(assertSecret(import.meta.env.WOTB_VERSION));

const hashes = await proxyClient.GetProtoHashes({});

console.log(hashes);

proxyClient.close();
