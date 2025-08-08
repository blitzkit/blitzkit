import { Flex } from '@radix-ui/themes';
import type { TankGuide } from '../../../pages/[...locale]/tanks/[slug]/index.astro';
import { GuidesBlitz } from './components/GuidesBlitz';

interface Props {
  guide: TankGuide;
}

export function GuideSection({ guide }: Props) {
  return (
    <Flex justify="center">
      <Flex maxWidth="40rem" direction="column" gap="4">
        <GuidesBlitz guide={guide} />
      </Flex>
    </Flex>
  );
}
