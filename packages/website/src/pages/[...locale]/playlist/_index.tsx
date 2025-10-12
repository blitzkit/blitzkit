import { PageWrapper } from "../../../components/PageWrapper";
import { PlaylistPool } from "../../../components/PlaylistFilters";
import { LocaleProvider } from "../../../hooks/useLocale";
import type { MaybeSkeletonComponentProps } from "../../../types/maybeSkeletonComponentProps";

interface Props {
  locale: string;
}

export function Page({
  locale,
  skeleton,
}: Props & MaybeSkeletonComponentProps) {
  return (
    <LocaleProvider locale={locale}>
      <PageWrapper color="tomato" direction="row">
        <PlaylistPool />
      </PageWrapper>
    </LocaleProvider>
  );
}
