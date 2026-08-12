import { type CompositeStatsKey } from "@blitzkit/core";
import { grayA, grayDark, grayDarkA } from "@radix-ui/colors";
import type { ReactNode } from "react";
import {
  BreakdownPreview,
  BreakdownRenderer,
  compositeStatsKeysOptions,
} from "../components/Embeds/breakdown";
import type {
  EmbedConfig,
  ExtractEmbedConfigTypes,
} from "../stores/embedState";
import { EmbedItemType } from "../stores/embedState/constants";

export const breakdownConfig = {
  width: { type: EmbedItemType.Slider, default: 320, min: 128, max: 640 },
  height: { type: EmbedItemType.Slider, default: 492, min: 128, max: 1024 },

  showTotal: { type: EmbedItemType.Boolean, default: true, pad: true },

  listGap: { type: EmbedItemType.Size, default: "2" },
  listMaxTanks: {
    type: EmbedItemType.Slider,
    default: 4,
    min: 0,
    max: 8,
    pad: true,
  },

  cardRadius: { type: EmbedItemType.Radius, default: "2" },
  cardHeaderBackgroundColor: {
    type: EmbedItemType.Color,
    default: grayDarkA.grayA3,
  },
  cardHeaderPadding: { type: EmbedItemType.Size, default: "1" },
  cardTitle: {
    type: EmbedItemType.RichText,
    default: { color: grayDark.gray12, weight: "bold", size: "3" },
  },
  cardTitleTypeColor: { type: EmbedItemType.Boolean, default: true },
  cardTitleClassIcon: { type: EmbedItemType.Boolean, default: true },
  cardBodyBackgroundColor: {
    type: EmbedItemType.Color,
    default: grayA.grayA11,
  },
  cardBodyPadding: {
    type: EmbedItemType.Size,
    default: "2",
    pad: true,
  },

  columnGap: { type: EmbedItemType.Size, default: "0" },
  columnValue: {
    type: EmbedItemType.RichText,
    default: { color: grayDark.gray12, size: "3", weight: "regular" },
  },
  columnLabel: {
    type: EmbedItemType.RichText,
    default: { color: grayDark.gray11, size: "2", weight: "regular" },
    pad: true,
  },

  column1: {
    type: EmbedItemType.Enum,
    default: "cumulative_battles" satisfies CompositeStatsKey,
    options: compositeStatsKeysOptions,
  },
  column2: {
    type: EmbedItemType.Enum,
    default: "normalized_wins" satisfies CompositeStatsKey,
    options: compositeStatsKeysOptions,
  },
  column3: {
    type: EmbedItemType.Enum,
    default: "cumulative_wn8" satisfies CompositeStatsKey,
    options: compositeStatsKeysOptions,
  },
  column4: {
    type: EmbedItemType.Enum,
    default: "normalized_damage_dealt" satisfies CompositeStatsKey,
    options: compositeStatsKeysOptions,
  },
  column1CustomLabel: { type: EmbedItemType.String, default: "" },
  column2CustomLabel: { type: EmbedItemType.String, default: "" },
  column3CustomLabel: { type: EmbedItemType.String, default: "" },
  column4CustomLabel: { type: EmbedItemType.String, default: "" },
} satisfies EmbedConfig;

export const embedConfigurations = {
  breakdown: breakdownConfig,
} satisfies Record<string, EmbedConfig>;

export const embedPreviews = {
  breakdown: BreakdownPreview,
} satisfies Record<string, () => ReactNode>;

export function extractEmbedConfigDefaults<Config extends EmbedConfig>(
  config: Config,
) {
  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => [key, value.default]),
  ) as ExtractEmbedConfigTypes<Config>;
}

export const embedRenderers = {
  breakdown: BreakdownRenderer,
} satisfies Record<string, () => ReactNode>;
