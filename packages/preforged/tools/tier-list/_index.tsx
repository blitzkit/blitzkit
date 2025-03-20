import { PageWrapper } from '../../../../components/PageWrapper';
import { FilterControl } from '../../../../components/TankSearch/components/FilterControl';
import { TierListControls } from '../../../../components/TierList/Controls';
import { TierListTable } from '../../../../components/TierList/Table';
import { TierListTiles } from '../../../../components/TierList/Tiles';
import { URLManager } from '../../../../components/TierList/URLManager';
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from '../../../../hooks/useLocale';
import { TankopediaPersistent } from '../../../../stores/tankopediaPersistent';
import { TierList } from '../../../../stores/tierList';

export function Page({ locale }: LocaleAcceptorProps) {
  return (
    <LocaleProvider locale={locale}>
      <TierList.Provider>
        <TankopediaPersistent.Provider>
          <Content />
        </TankopediaPersistent.Provider>
      </TierList.Provider>
    </LocaleProvider>
  );
}

function Content() {
  return (
    <PageWrapper color="orange" maxWidth="100rem">
      <URLManager />
      <TierListControls />
      <TierListTable />
      <FilterControl />
      <TierListTiles />
    </PageWrapper>
  );
}
