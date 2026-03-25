import {
  asset,
  TankPriceType,
  TankType,
  TIER_ROMAN_NUMERALS,
} from '@blitzkit/core';
import { Box, Flex } from '@radix-ui/themes';
import { Var } from '../../../core/radix/var';
import { useLocale } from '../../../hooks/useLocale';
import { App } from '../../../stores/app';
import { Duel } from '../../../stores/duel';
import { classIcons } from '../../ClassIcon';
import { CopyableCode } from '../../CopyableCode';
import { Listing } from './components/Listing';

const NATIONAL_BANNER_POSITION_OVERRIDES: Record<string, string> = {
  germany: '50% 35%',
  france: '50% 35%',
  other: '50% 35%',
};

export function MetaSection() {
  const developerMode = App.useDeferred((state) => state.developerMode, false);
  const protagonist = Duel.use((state) => state.protagonist.tank);
  const ClassIcon = classIcons[protagonist.class];
  const { locale, strings } = useLocale();
  const devName = (protagonist as { dev_name?: string }).dev_name;

  return (
    <Flex justify="center" mt="-9">
      <Box
        style={{
          background: `url(/assets/images/national-wallpapers/${protagonist.nation}.jpg)`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition:
            NATIONAL_BANNER_POSITION_OVERRIDES[protagonist.nation] ?? 'center',
        }}
        flexGrow="1"
        maxWidth="120rem"
      >
        <Box
          style={{
            background: `url(${asset(`flags/scratched/${protagonist.nation}.webp`)})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'min(53rem, 80vw)',
            backgroundPosition: '-8rem 50%',
          }}
        >
          <Flex
            justify="center"
            align="center"
            py="6rem"
            style={{
              background: `linear-gradient(${Var('black-a8')}, ${Var('black-a8')}, ${Var('gray-1')})`,
            }}
          >
            <Flex direction="column" align="center" gap="6">
              <Flex
                gap={{ initial: '2', sm: '8' }}
                direction={{ initial: 'column', sm: 'row' }}
              >
                <Flex direction="column" width="100%" gap="2">
                  <Listing label={strings.website.tools.tankopedia.meta.nation}>
                    <Flex align="center" gap="1">
                      <img
                        style={{ width: '1em', height: '1em' }}
                        alt={protagonist.nation}
                        src={asset(`flags/circle/${protagonist.nation}.webp`)}
                      />
                      {
                        strings.common.nations[
                          protagonist.nation as keyof typeof strings.common.nations
                        ]
                      }
                    </Flex>
                  </Listing>
                  <Listing label={strings.website.tools.tankopedia.meta.class}>
                    <Flex align="center" gap="1">
                      <ClassIcon width="1em" height="1em" />
                      {strings.common.tank_class_short[protagonist.class]}
                    </Flex>
                  </Listing>
                  <Listing label={strings.website.tools.tankopedia.meta.tier}>
                    {TIER_ROMAN_NUMERALS[protagonist.tier]}
                  </Listing>
                  <Listing
                    label={strings.website.tools.tankopedia.meta.type}
                    color={
                      protagonist.type === TankType.COLLECTOR
                        ? 'blue'
                        : protagonist.type === TankType.PREMIUM
                          ? 'amber'
                          : undefined
                    }
                  >
                    {strings.common.tree_type[protagonist.type]}
                  </Listing>
                </Flex>

                <Flex direction="column" width="100%" gap="2">
                  {developerMode && (
                    <Listing
                      label={strings.website.tools.tankopedia.meta.dev_id}
                    >
                      <CopyableCode
                        copy={`${protagonist.id}`}
                        variant="soft"
                        highContrast
                        color="gray"
                      >
                        {protagonist.id}
                      </CopyableCode>
                    </Listing>
                  )}
                  {developerMode && devName && (
                    <Listing
                      label={strings.website.tools.tankopedia.meta.dev_name}
                    >
                      <CopyableCode
                        copy={devName}
                        variant="soft"
                        highContrast
                        color="gray"
                      >
                        {devName}
                      </CopyableCode>
                    </Listing>
                  )}
                  {protagonist.type === TankType.PREMIUM && (
                    <Listing
                      label={strings.website.tools.tankopedia.meta.purchase}
                    >
                      <Flex align="center" gap="1">
                        {protagonist.price.value / 400}
                        <img
                          style={{ width: '1em', height: '1em' }}
                          alt="gold"
                          src={asset('icons/currencies/gold.webp')}
                        />
                      </Flex>
                    </Listing>
                  )}
                  <Listing
                    label={
                      protagonist.type === TankType.RESEARCHABLE
                        ? strings.website.tools.tankopedia.meta.purchase
                        : strings.website.tools.tankopedia.meta.restoration
                    }
                  >
                    <Flex align="center" gap="1">
                      {protagonist.price.value.toLocaleString(locale)}
                      <img
                        style={{ width: '1em', height: '1em' }}
                        alt={TankPriceType[protagonist.price.type]}
                        src={asset(
                          `icons/currencies/${
                            protagonist.price.type === TankPriceType.GOLD
                              ? 'gold'
                              : 'silver'
                          }.webp`,
                        )}
                      />
                    </Flex>
                  </Listing>
                  <Listing label={strings.website.tools.tankopedia.meta.sale}>
                    <Flex align="center" gap="1">
                      {(protagonist.price.value / 2).toLocaleString(locale)}
                      <img
                        style={{ width: '1em', height: '1em' }}
                        alt={TankPriceType[protagonist.price.type]}
                        src={asset(
                          `icons/currencies/${
                            protagonist.price.type === TankPriceType.GOLD
                              ? 'gold'
                              : 'silver'
                          }.webp`,
                        )}
                      />
                    </Flex>
                  </Listing>
                  {protagonist.research_cost && (
                    <Listing
                      label={strings.website.tools.tankopedia.meta.research}
                    >
                      <Flex align="center" gap="1">
                        {(
                          protagonist.research_cost.research_cost_type!
                            .value as number
                        ).toLocaleString(locale)}
                        <img
                          style={{ width: '1em', height: '1em' }}
                          alt="xp"
                          src={asset('icons/currencies/xp.webp')}
                        />
                      </Flex>
                    </Listing>
                  )}
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
}
