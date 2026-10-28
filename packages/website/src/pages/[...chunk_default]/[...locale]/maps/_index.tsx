import { MapSearch } from "../../../../components/MapSearch";
import { PageWrapper } from "../../../../components/PageWrapper";
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from "../../../../hooks/useLocale";

export function Page({ locale }: LocaleAcceptorProps) {
  return (
    <LocaleProvider locale={locale}>
      <PageWrapper color="green" maxWidth="80rem">
        <MapSearch />
      </PageWrapper>
    </LocaleProvider>
  );
}
