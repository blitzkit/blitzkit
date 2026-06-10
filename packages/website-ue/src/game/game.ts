import { assertSecret } from "@blitzkit/core";
import type { GameInterface } from "@blitzkit/game";
import { clientUnmounted } from "./unmounted";
import { api } from "../api/dynamic";
import { assertDiscoveryTag } from "./assertDiscoveryTag";

let _game: GameInterface | null = null;

if (!clientUnmounted && import.meta.env.SSR) {
  console.log("Pre-import");

  const { GameInterface } = await import("@blitzkit/game");

  console.log("Pre-creation");

  _game = new GameInterface(
    assertSecret(import.meta.env.PUBLIC_WOTB_CLIENT),
    assertSecret(import.meta.env.WOTB_USMAP),
    "../../temp",
  );

  console.log("Pre-tags");

  const tankTags: string[] = [];

  for (const item of api.metadata.group("TankEntity")) {
    const assetDiscovery = item.BlitzStaticAssetsDiscovery();
    const tag = assertDiscoveryTag(assetDiscovery);

    tankTags.push(tag);
  }

  console.log("Pre-discovery");

  _game.discoverTextures(tankTags);

  console.log("Post-discovery");
}

export const game = _game;
