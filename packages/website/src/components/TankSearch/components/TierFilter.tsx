import { TIER_ROMAN_NUMERALS } from '@blitzkit/core';
import { useStore } from '@nanostores/react';
import { Flex, IconButton, Text } from '@radix-ui/themes';
import { times } from 'lodash-es';
import { memo } from 'react';
import { $tankFilters } from '../../../stores/tankFilters';
import { TankSort } from '../../../stores/tankopediaSort';

export const TierFilter = memo(() => {
  const tankFilters = useStore($tankFilters);
  const by = TankSort.use((state) => state.by);

  if (by !== 'meta.none' || tankFilters.search) return null;

  return (
    <Flex justify="center">
      <Flex
        direction="row"
        overflow="hidden"
        style={{ borderRadius: 'var(--radius-full)' }}
      >
        {times(10, (index) => {
          const tier = 10 - index;
          const selected = tankFilters.tiers.includes(tier);

          return (
            <IconButton
              key={tier}
              variant={selected ? 'solid' : 'soft'}
              radius="none"
              color={selected ? undefined : 'gray'}
              highContrast
              onClick={() => {
                if (tankFilters.tiers.includes(tier)) {
                  $tankFilters.setKey(
                    'tiers',
                    tankFilters.tiers.filter((t) => t !== tier),
                  );
                } else {
                  $tankFilters.setKey('tiers', [...tankFilters.tiers, tier]);
                }
              }}
            >
              <Text size="2">{TIER_ROMAN_NUMERALS[tier]}</Text>
            </IconButton>
          );
        })}
      </Flex>
    </Flex>
  );
});
