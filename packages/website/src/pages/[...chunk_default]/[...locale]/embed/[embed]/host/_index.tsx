import { useMemo } from "react";
import { parse } from "urlon";
import {
  embedConfigurations,
  embedRenderers,
  extractEmbedConfigDefaults,
} from "../../../../../../config/embeds";
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from "../../../../../../hooks/useLocale";
import {
  EmbedState,
  type EmbedConfig,
  type ExtractEmbedConfigTypes,
} from "../../../../../../stores/embedState";
import { useEmbedStateCurry } from "../../../../../../stores/embedState/utilities";
import styles from "./_index.module.css";

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

  EmbedState.useInitialization(() => state, import.meta.env.SSR);

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
    <div
      className={styles.embed}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <Renderer />
    </div>
  );
}
