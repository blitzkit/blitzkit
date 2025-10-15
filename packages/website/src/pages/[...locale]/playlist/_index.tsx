import { PageWrapper } from "../../../components/PageWrapper";
import { PlaylistGenerator } from "../../../components/PlaylistGenerator";
import { PlaylistOrder } from "../../../components/PlaylistOrder";
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
  const generated = Playlist.use((state) => state.list !== undefined);

  if (App.state.logins.wargaming && TankFilters.state.ownership !== "owned") {
    TankFilters.state.ownership = "owned";
  }

  return (
    <LocaleProvider locale={locale}>
      <PageWrapper color="tomato" direction="row" maxWidth="unset" p="0">
        {!generated && <PlaylistGenerator skeleton={skeleton} />}
        {generated && <PlaylistOrder />}
      </PageWrapper>
    </LocaleProvider>
  );
}
