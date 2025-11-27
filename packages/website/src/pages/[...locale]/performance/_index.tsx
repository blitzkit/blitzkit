import { PageWrapper } from "../../../components/PageWrapper";
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
    <PageWrapper pb="0" px="0" color="jade" maxWidth="100%">
      <FilterControl />
      <PlayerCountControl />

      <TankTable skeleton={skeleton} />
    </PageWrapper>
  );
}
