import { TankClass, TankType } from "@blitzkit/core";
import { ButtonInteraction } from "discord.js";
import type { StatFilters } from "../blitzstars/filterStats";

export function getFiltersFromButton(interaction: ButtonInteraction) {
  const url = new URL(`https://example.com/${interaction.customId}`);

  return {
    nation: url.searchParams.get("nation") ?? undefined,
    tank: parseInt(url.searchParams.get("tank") ?? "0") || undefined,
    class:
      (Number(url.searchParams.get("class")) as TankClass | undefined) ??
      undefined,
    type:
      (Number(url.searchParams.get("type")) as TankType | undefined) ??
      undefined,
    tier: parseInt(url.searchParams.get("tier") ?? "0") || undefined,
  } satisfies StatFilters;
}
