import { assertSecret } from "@blitzkit/core";
import type { GameInterface } from "@blitzkit/game";
import { clientUnmounted } from "./unmounted";
import { api } from "../api/dynamic";
import { assertDiscoveryTag } from "./assertDiscoveryTag";

let _game: GameInterface | null = null;

if (!clientUnmounted && import.meta.env.SSR) {
  const { GameInterface } = await import("@blitzkit/game");

  _game = new GameInterface(
    assertSecret(import.meta.env.PUBLIC_WOTB_CLIENT),
    assertSecret(import.meta.env.WOTB_USMAP),
    "../../temp",
    Number(assertSecret(import.meta.env.TEXTURE_CHUNKS)),
  );

  const tankTags: string[] = [];

  for (const item of api.metadata.group("TankEntity")) {
    const assetDiscovery = item.BlitzStaticAssetsDiscovery();
    const tag = assertDiscoveryTag(assetDiscovery);

    tankTags.push(tag);
  }

  _game.discoverTextures(tankTags);
}

export const game = _game;
