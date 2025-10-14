import type { Region } from "@blitzkit/core";
import { ButtonInteraction } from "discord.js";
import type { ResolvedPlayer } from "./resolvePlayerFromCommand";

export async function resolvePlayerFromButton(interaction: ButtonInteraction) {
  const url = new URL(`https://exmaple.com/${interaction.customId}`);

  return {
    id: parseInt(url.searchParams.get("id")!),
    region: url.searchParams.get("region") as Region,
  } satisfies ResolvedPlayer;
}
