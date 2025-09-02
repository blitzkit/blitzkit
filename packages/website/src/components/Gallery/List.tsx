import locales from "@blitzkit/i18n/locales.json";
import { literals } from "@blitzkit/i18n/src/literals";
import { Flex, Text } from "@radix-ui/themes";
import fuzzysort from "fuzzysort";
import { times } from "lodash-es";
import { useMemo, useState } from "react";
import { awaitableGallery } from "../../core/awaitables/gallery";
import { useLocale } from "../../hooks/useLocale";
import { Gallery } from "../../stores/gallery";
import type { MaybeSkeletonComponentProps } from "../../types/maybeSkeletonComponentProps";
import { InlineSkeleton } from "../InlineSkeleton";
import { GalleryCard } from "./Card";

export interface Avatar {
  name: string;
  id: string;
}

const gallery = await awaitableGallery;

const DEFAULT_LOADED = 42;
const PREVIEW_COUNT = 28;

export function GalleryList({ skeleton }: MaybeSkeletonComponentProps) {
  const search = Gallery.use((state) => state.search);
  const [loadedCards, setLoadedCards] = useState(DEFAULT_LOADED);
  const { locale, strings } = useLocale();
  const filtered = useMemo(() => {
    setLoadedCards(DEFAULT_LOADED);

    if (search === undefined) {
      return gallery.avatars;
    } else {
      return fuzzysort
        .go(search, gallery.avatars, {
          keys: [
            ...locales.supported.map(
              (supported) => `name.locales.${supported.locale}`
            ),
            "id",
          ],
        })
        .map((result) => result.obj);
    }
  }, [search]);

  return (
    <>
      <Text align="center" color="gray">
        {skeleton ? (
          <InlineSkeleton width="7rem" />
        ) : (
          literals(strings.website.tools.gallery.search.results, [
            filtered.length.toLocaleString(locale),
          ])
        )}
      </Text>

      <Flex wrap="wrap" gap="4" justify="center">
        {!skeleton &&
          filtered
            .slice(0, loadedCards)
            .map((avatar) => <GalleryCard key={avatar.id} avatar={avatar} />)}

        {times(
          skeleton
            ? DEFAULT_LOADED + PREVIEW_COUNT
            : Math.min(PREVIEW_COUNT, filtered.length - loadedCards),
          (index) => (
            <GalleryCard
              key={index}
              skeleton
              onIntersection={() => setLoadedCards((state) => state + 2)}
            />
          )
        )}
      </Flex>
    </>
  );
}
