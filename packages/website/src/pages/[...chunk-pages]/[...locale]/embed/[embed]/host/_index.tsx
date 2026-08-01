import { Box } from "@radix-ui/themes";
import { useMemo } from "react";
import { parse } from "urlon";
import { BlitzKitTheme } from "../../../../../components/BlitzKitTheme";
import {
  embedConfigurations,
  embedRenderers,
  extractEmbedConfigDefaults,
} from "../../../../../constants/embeds";
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from "../../../../../hooks/useLocale";
import {
  EmbedState,
  type EmbedConfig,
  type ExtractEmbedConfigTypes,
} from "../../../../../stores/embedState";
import { useEmbedStateCurry } from "../../../../../stores/embedState/utilities";

interface PageProps {
  embed: keyof typeof embedConfigurations;
}

export function Page({ embed, locale }: PageProps & LocaleAcceptorProps) {
  const state = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const stateRaw = params.get("state");
    const partialState = stateRaw === null ? {} : parse(stateRaw);
    const state = {
      ...extractEmbedConfigDefaults(embedConfigurations[embed]),
      ...partialState,
    } as ExtractEmbedConfigTypes<EmbedConfig>;

    return state;
  }, [embed]);

  EmbedState.useInitialization(state);

  return (
    <LocaleProvider locale={locale}>
      <Content embed={embed} />
    </LocaleProvider>
  );
}

function Content({ embed }: PageProps) {
  const Renderer = embedRenderers[embed];
  const { useEmbedState } = useEmbedStateCurry();
  const width = useEmbedState("width");
  const height = useEmbedState("height");

  return (
    <BlitzKitTheme style={{ background: "transparent" }}>
      <Box width={`${width}px`} height={`${height}px`} overflow="hidden">
        <Renderer />
      </Box>
    </BlitzKitTheme>
  );
}
