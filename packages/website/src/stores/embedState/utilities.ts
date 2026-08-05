import type { TextProps } from "@radix-ui/themes";
import { EmbedState, type EmbedConfig, type ExtractEmbedConfigTypes } from ".";
import {
  breakdownConfig,
  extractEmbedConfigDefaults,
} from "../../constants/embeds";
import type { EmbedConfigItemType, EmbedItemType } from "./constants";

export function useEmbedStateCurry<Config extends EmbedConfig>() {
  // TODO: find a way to initialize with the correct state preset
  EmbedState.useInitialization(extractEmbedConfigDefaults(breakdownConfig));

  function useEmbedState<Key extends keyof Config>(key: Key) {
    return EmbedState.use((state) => {
      return (state as ExtractEmbedConfigTypes<Config>)[key];
    });
  }

  function useRichText<
    Key extends {
      [K in keyof Config]: Config[K] extends { type: EmbedItemType.RichText }
        ? K
        : never;
    }[keyof Config],
  >(key: Key) {
    const { color, ...state } = useEmbedState(
      key,
    ) as EmbedConfigItemType<EmbedItemType.RichText>["default"];

    return {
      style: { color },
      ...state,
    } satisfies TextProps;
  }

  return { useEmbedState, useRichText };
}
