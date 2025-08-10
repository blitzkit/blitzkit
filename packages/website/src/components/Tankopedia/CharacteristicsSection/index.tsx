import { Flex } from '@radix-ui/themes';
import type { MaybeSkeletonComponentProps } from '../../../types/maybeSkeletonComponentProps';
import { Characteristics } from './components/Characteristics';
import { CompareOptions } from './components/Characteristics/components/CompareOptions';
import { StatSearch } from './components/Characteristics/components/StatSearch';
import { Consumables } from './components/Consumables';
import { Equipment } from './components/Equipment';
import { Miscellaneous } from './components/Miscellaneous';
import { Modules } from './components/Modules';
import { Provisions } from './components/Provisions';
import { Skills } from './components/Skills';

export function CharacteristicsSection({
  skeleton,
}: MaybeSkeletonComponentProps) {
  return (
    <Flex direction="column" gap="3">
      <Flex
        display={{ initial: 'none', sm: 'flex' }}
        direction={{ initial: 'column', md: 'row' }}
        align="center"
        justify="center"
        mb="8"
        gap={{ initial: '4', md: '8' }}
      >
        <CompareOptions />
        <StatSearch />
      </Flex>

      <Flex mt="4" px="4" style={{ boxSizing: 'border-box' }} gap="6">
        <Flex
          flexGrow="1"
          gap="9"
          justify="center"
          align={{ initial: 'center', sm: 'start' }}
          direction={{ initial: 'column', sm: 'row' }}
        >
          <Flex
            direction="column"
            gap="6"
            maxWidth="19rem"
            align={{ initial: 'center', sm: 'start' }}
          >
            <Modules />
            <Equipment />
            <Provisions />
            <Consumables />
            <Skills />
            <Miscellaneous />
          </Flex>

          <Flex
            direction="column"
            gap="6"
            align={{ initial: 'stretch', sm: 'center' }}
            width={{ initial: '100%', sm: 'auto' }}
          >
            <Flex
              display={{ initial: 'flex', sm: 'none' }}
              direction="column"
              align="center"
              justify="center"
              mb="8"
              gap="8"
            >
              <StatSearch />
              <CompareOptions />
            </Flex>

            <Characteristics skeleton={skeleton} />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
