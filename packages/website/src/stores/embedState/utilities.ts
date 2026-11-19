import { EmbedState, type EmbedConfig, type ExtractEmbedConfigTypes } from ".";
import {
  breakdownConfig,
  extractEmbedConfigDefaults,
} from "../../constants/embeds";
import type { EmbedConfigItemType, EmbedItemType } from "./constants";
import { embedText } from "./tokens";

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
    const state = useEmbedState(
      key,
    ) as EmbedConfigItemType<EmbedItemType.RichText>["default"];

    return embedText(state);
  }

  return { useEmbedState, useRichText };
}
