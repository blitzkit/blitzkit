import { CaretRightIcon } from '@radix-ui/react-icons';
import { Box, Flex, Link, Text } from '@radix-ui/themes';
import { Var } from '../../../../core/radix/var';
import type { TankGuide } from '../../../../pages/[...locale]/tanks/[slug]/index.astro';

interface Props {
  guide: TankGuide;
}

export function GuidesBlitz({ guide }: Props) {
  return (
    <>
      <Flex direction="column" gap="4" position="relative">
        <Text size="4" weight="medium">
          <Flex width="100%" justify="start" align="center" gap="2">
            <img
              style={{
                width: '1.5em',
                height: '1.5em',
                objectFit: 'contain',
              }}
              src="https://guidesblitz.com/wp-content/uploads/2023/11/cropped-logo-1.png"
            />
            GuidesBlitz
          </Flex>
        </Text>

        <Text size="2">{guide.description}</Text>
        <img style={{ width: '100%' }} src={guide.image} />

        <Box
          position="absolute"
          bottom="0"
          width="100%"
          height="100%"
          left="0"
          style={{
            background: `linear-gradient(${Var('gray-a1')}, ${Var('gray-1')})`,
          }}
        />
      </Flex>

      <Link underline="always" href={guide.url} target="_blank">
        <Flex width="100%" justify="center" align="center" gap="1">
          Read the full guide
          <CaretRightIcon width="1em" height="1em" />
        </Flex>
      </Link>
    </>
  );
}
