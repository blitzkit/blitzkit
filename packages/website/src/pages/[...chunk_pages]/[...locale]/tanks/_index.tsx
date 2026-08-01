import { PageWrapper } from "../../../components/PageWrapper";
import { TankSearch } from "../../../components/TankSearch";
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from "../../../hooks/useLocale";
import type { MaybeSkeletonComponentProps } from "../../../types/maybeSkeletonComponentProps";

export function Page({
  locale,
  skeleton,
}: LocaleAcceptorProps & MaybeSkeletonComponentProps) {
  return (
    <LocaleProvider locale={locale}>
      <PageWrapper color="purple" maxWidth="80rem">
        <TankSearch skeleton={skeleton} />
      </PageWrapper>
    </LocaleProvider>
  );
}
