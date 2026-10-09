import { uniq } from "lodash-es";
import { useEffect } from "react";
import { MAX_RECENTLY_VIEWED } from "../../../../../components/MapSearch/constants";
import { HeroSection } from "../../../../../components/Maps/HeroSection";
import { MinimapSection } from "../../../../../components/Maps/MinimapSection";
import { PageWrapper } from "../../../../../components/PageWrapper";
import { api } from "../../../../../core/blitzkit/api";
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from "../../../../../hooks/useLocale";
import { Maps } from "../../../../../stores/maps";
import { MapsPersistent } from "../../../../../stores/mapsPersistent";
import type { MaybeSkeletonComponentProps } from "../../../../../types/maybeSkeletonComponentProps";

type PageProps = MaybeSkeletonComponentProps &
  LocaleAcceptorProps & {
    id: number;
  };

const mapDefinitions = await api.mapDefinitions();

export function Page({ id, skeleton, locale }: PageProps) {
  Maps.useInitialization(id);

  useEffect(() => {
    if (skeleton) return;

    MapsPersistent.mutate((draft) => {
      draft.recentlyViewed = uniq([id, ...draft.recentlyViewed])
        .filter((mapId) => mapId in mapDefinitions.maps)
        .slice(0, MAX_RECENTLY_VIEWED);
    });
  }, [id]);

  return (
    <LocaleProvider locale={locale}>
      <PageWrapper p="0" maxWidth="unset" color="green" gap="9" pb="9">
        <HeroSection skeleton={skeleton} />
        <MinimapSection />
      </PageWrapper>
    </LocaleProvider>
  );
}
