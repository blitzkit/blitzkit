import { ReloadIcon } from '@radix-ui/react-icons';
import { Button, Flex } from '@radix-ui/themes';
import { useLocale } from '../../../hooks/useLocale';
import { TierList } from '../../../stores/tierList';
import { Share } from './components/Share';

export function TierListControls() {
  const { strings } = useLocale();

  return (
    <Flex justify="center" gap="2">
      <Button
        color="red"
        onClick={() => {
          TierList.mutate((draft) => {
            Object.assign(draft, TierList.initial);
          });
        }}
      >
        <ReloadIcon /> {strings.website.tools.tier_list.buttons.reset}
      </Button>

      <Share />
    </Flex>
  );
}
