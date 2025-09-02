import { GalleryList } from "../../../components/Gallery/List";
import { GallerySearch } from "../../../components/Gallery/Search";
import { PageWrapper } from "../../../components/PageWrapper";
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from "../../../hooks/useLocale";
import type { MaybeSkeletonComponentProps } from "../../../types/maybeSkeletonComponentProps";

export function Page({
  locale,
  ...props
}: LocaleAcceptorProps & MaybeSkeletonComponentProps) {
  return (
    <LocaleProvider locale={locale}>
      <Content {...props} />
    </LocaleProvider>
  );
}

function Content({ skeleton }: MaybeSkeletonComponentProps) {
  return (
    <PageWrapper maxWidth="80rem" color="gold">
      <GallerySearch skeleton={skeleton} />
      <GalleryList skeleton={skeleton} />
    </PageWrapper>
  );
}
