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

  show_total: { type: EmbedItemType.Boolean, default: true, pad: true },

  list_gap: { type: EmbedItemType.Size, default: "3" },
  list_max_tanks: {
    type: EmbedItemType.Slider,
    default: 4,
    min: 0,
    max: 8,
    pad: true,
  },

  card_radius: { type: EmbedItemType.Radius, default: "2" },
  card_header_background_color: {
    type: EmbedItemType.Color,
    default: grayDarkA.grayA3,
  },
  card_header_padding: { type: EmbedItemType.Size, default: "2" },
  card_title: {
    type: EmbedItemType.RichText,
    default: { color: grayDark.gray12, weight: "bold", size: "4" },
  },
  card_title_type_color: { type: EmbedItemType.Boolean, default: true },
  card_title_class_icon: { type: EmbedItemType.Boolean, default: true },
  card_body_background_color: {
    type: EmbedItemType.Color,
    default: grayA.grayA11,
  },
  card_body_padding: {
    type: EmbedItemType.Size,
    default: "3",
    pad: true,
  },

  column_gap: { type: EmbedItemType.Size, default: "1" },
  column_value: {
    type: EmbedItemType.RichText,
    default: { color: grayDark.gray12, size: "4", weight: "regular" },
  },
  column_label: {
    type: EmbedItemType.RichText,
    default: { color: grayDark.gray11, size: "4", weight: "regular" },
    pad: true,
  },

  column_1: {
    type: EmbedItemType.Enum,
    default: "cumulative_battles" satisfies CompositeStatsKey,
    options: compositeStatsKeysOptions,
  },
  column_2: {
    type: EmbedItemType.Enum,
    default: "normalized_wins" satisfies CompositeStatsKey,
    options: compositeStatsKeysOptions,
  },
  column_3: {
    type: EmbedItemType.Enum,
    default: "cumulative_wn8" satisfies CompositeStatsKey,
    options: compositeStatsKeysOptions,
  },
  column_4: {
    type: EmbedItemType.Enum,
    default: "normalized_damage_dealt" satisfies CompositeStatsKey,
    options: compositeStatsKeysOptions,
  },
  column_1_custom_label: { type: EmbedItemType.String, default: "" },
  column_2_custom_label: { type: EmbedItemType.String, default: "" },
  column_3_custom_label: { type: EmbedItemType.String, default: "" },
  column_4_custom_label: { type: EmbedItemType.String, default: "" },
} satisfies EmbedConfig;

export const embedConfigurations = {
  breakdown: breakdownConfig,
} satisfies Record<string, EmbedConfig>;

export const embedPreviews = {
  breakdown: BreakdownPreview,
} satisfies Record<string, () => ReactNode>;

export function extractEmbedConfigDefaults<Config extends EmbedConfig>(
  config: Config
) {
  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => [key, value.default])
  ) as ExtractEmbedConfigTypes<Config>;
}

export const embedRenderers = {
  breakdown: BreakdownRenderer,
} satisfies Record<string, () => ReactNode>;
