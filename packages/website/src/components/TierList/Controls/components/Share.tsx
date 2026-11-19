import { Share2Icon } from '@radix-ui/react-icons';
import { generateTierListParams } from '../../../../core/blitzkit/generateTierListParams';
import { useLocale } from '../../../../hooks/useLocale';
import { TierList } from '../../../../stores/tierList';
import { CopyButton } from '../../../CopyButton';

export function Share() {
  const rows = TierList.use((state) => state.rows);
  const { strings } = useLocale();

  return (
    <CopyButton
      variant="outline"
      copy={() =>
        `${location.origin}/tier-list?${generateTierListParams(rows)}`
      }
    >
      <Share2Icon />
      {strings.website.tools.tier_list.buttons.share}
    </CopyButton>
  );
}
