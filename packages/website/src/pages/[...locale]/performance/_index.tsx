import { PageWrapper } from "../../../components/PageWrapper";
import { PerformanceInfo } from "../../../components/Performance/PerformanceInfo";
import { PlayerCountControl } from "../../../components/Performance/PlayerCountControl";
import { TankTable } from "../../../components/Performance/Table";
import { FilterControl } from "../../../components/TankSearch/components/FilterControl";
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from "../../../hooks/useLocale";
import type { MaybeSkeletonComponentProps } from "../../../types/maybeSkeletonComponentProps";

type PageProps = MaybeSkeletonComponentProps & LocaleAcceptorProps;

export function Page({ skeleton, locale }: PageProps) {
  return (
    <LocaleProvider locale={locale}>
      <Content skeleton={skeleton} />
    </LocaleProvider>
  );
}

function Content({ skeleton }: MaybeSkeletonComponentProps) {
  return (
    <PageWrapper color="jade" maxWidth="100%">
      <PerformanceInfo skeleton={skeleton} />
      <FilterControl />
      <PlayerCountControl />

      <TankTable skeleton={skeleton} />
    </PageWrapper>
  );
}
