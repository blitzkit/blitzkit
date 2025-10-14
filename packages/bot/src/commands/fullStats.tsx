import {
  emblemURL,
  getAccountInfo,
  getClanAccountInfo,
  getTierWeights,
} from '@blitzkit/core';
import { Locale } from 'discord.js';
import { CommandWrapper } from '../components/CommandWrapper';
import { GenericAllStats } from '../components/GenericAllStats';
import { NoData } from '../components/NoData';
import { TierWeights } from '../components/TierWeights';
import { TitleBar } from '../components/TitleBar';
import { filtersToDescription } from '../core/blitzkit/filtersToDescription';
import { filterStats, type StatFilters } from '../core/blitzstars/filterStats';
import { getBlitzStarsLinkButton } from '../core/blitzstars/getBlitzStarsLinkButton';
import { getStatsInPeriod } from '../core/blitzstars/getStatsInPeriod';
import { addPeriodicFilterOptions } from '../core/discord/addPeriodicFilterOptions';
import { addUsernameChoices } from '../core/discord/addUsernameChoices';
import { autocompleteTanks } from '../core/discord/autocompleteTanks';
import { autocompleteUsername } from '../core/discord/autocompleteUsername';
import { buttonRefresh } from '../core/discord/buttonRefresh';
import { commandToURL } from '../core/discord/commandToURL';
import { createLocalizedCommand } from '../core/discord/createLocalizedCommand';
import { getCustomPeriodParams } from '../core/discord/getCustomPeriodParams';
import { getFiltersFromButton } from '../core/discord/getFiltersFromButton';
import { getFiltersFromCommand } from '../core/discord/getFiltersFromCommand';
import { resolvePeriodFromButton } from '../core/discord/resolvePeriodFromButton';
import {
  type ResolvedPeriod,
  resolvePeriodFromCommand,
} from '../core/discord/resolvePeriodFromCommand';
import { resolvePlayerFromButton } from '../core/discord/resolvePlayerFromButton';
import {
  type ResolvedPlayer,
  resolvePlayerFromCommand,
} from '../core/discord/resolvePlayerFromCommand';
import type { CommandRegistry } from '../events/interactionCreate';

async function render(
  { region, id }: ResolvedPlayer,
  { start, end, name }: ResolvedPeriod,
  filters: StatFilters,
  locale: Locale,
) {
  const { nickname } = await getAccountInfo(region, id);
  const clan = (await getClanAccountInfo(region, id, ['clan']))?.clan;
  const clanImage = clan ? emblemURL(clan.emblem_set_id) : undefined;
  const diffedTankStats = await getStatsInPeriod(
    region,
    id,
    start,
    end,
    locale,
  );
  const { stats, supplementary, filteredOrder } = await filterStats(
    diffedTankStats,
    filters,
  );
  const filterDescriptions = await filtersToDescription(filters, locale);
  const tierWeights = await getTierWeights(diffedTankStats.diff, filteredOrder);

  return (
    <CommandWrapper>
      <TitleBar
        title={nickname}
        image={clanImage}
        description={`${name} • ${filterDescriptions}`}
      />

      {stats.battles === 0 && (
        <NoData type="battles_in_period" locale={locale} />
      )}
      {stats.battles > 0 && <TierWeights weights={tierWeights!} />}
      {stats.battles > 0 && (
        <GenericAllStats
          stats={stats}
          supplementaryStats={supplementary}
          locale={locale}
        />
      )}
    </CommandWrapper>
  );
}

export const fullStatsCommand = new Promise<CommandRegistry>(
  async (resolve) => {
    resolve({
      command: await addPeriodicFilterOptions(
        createLocalizedCommand('full-stats'),
        (option) => option.addStringOption(addUsernameChoices),
      ),

      async handler(interaction) {
        const player = await resolvePlayerFromCommand(interaction);
        const period = resolvePeriodFromCommand(player.region, interaction);
        const filters = await getFiltersFromCommand(interaction);
        const path = commandToURL(interaction, {
          ...player,
          ...getCustomPeriodParams(interaction),
          ...filters,
        });

        return Promise.all([
          render(player, period, filters, interaction.locale),
          buttonRefresh(interaction, path),
          getBlitzStarsLinkButton(player.region, player.id),
        ]);
      },

      autocomplete: (interaction) => {
        autocompleteUsername(interaction);
        autocompleteTanks(interaction);
      },

      async button(interaction) {
        const player = await resolvePlayerFromButton(interaction);
        const period = resolvePeriodFromButton(player.region, interaction);
        const filters = getFiltersFromButton(interaction);

        return await render(player, period, filters, interaction.locale);
      },
    });
  },
);
