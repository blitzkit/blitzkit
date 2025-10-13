import { useEffect } from "react";
import { PageWrapper } from "../../../components/PageWrapper";
import { PlaylistPool } from "../../../components/PlaylistFilters";
import { PlaylistGenerator } from "../../../components/PlaylistGenerator";
import { PlaylistOrder } from "../../../components/PLaylistOrder";
import { LocaleProvider } from "../../../hooks/useLocale";
import { App } from "../../../stores/app";
import { Playlist } from "../../../stores/playlist";
import { TankFilters } from "../../../stores/tankFilters";
import type { MaybeSkeletonComponentProps } from "../../../types/maybeSkeletonComponentProps";

interface Props {
  locale: string;
}

export function Page({
  locale,
  skeleton,
}: Props & MaybeSkeletonComponentProps) {
  const list = Playlist.use((state) => state.list);
  const wargaming = App.use((state) => state.logins.wargaming);

  useEffect(() => {
    if (wargaming) {
      TankFilters.mutate((draft) => {
        draft.ownership = "owned";
      });
    }
  }, []);

  return (
    <LocaleProvider locale={locale}>
      <PageWrapper color="tomato" direction="row" maxWidth="100rem">
        <PlaylistPool />
        {!list && <PlaylistGenerator />}
        {list && <PlaylistOrder />}
      </PageWrapper>
    </LocaleProvider>
  );
}
