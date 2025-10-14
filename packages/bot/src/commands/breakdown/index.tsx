import { getBlitzStarsLinkButton } from '../../core/blitzstars/getBlitzStarsLinkButton';
import { addPeriodicFilterOptions } from '../../core/discord/addPeriodicFilterOptions';
import { addUsernameChoices } from '../../core/discord/addUsernameChoices';
import { autocompleteTanks } from '../../core/discord/autocompleteTanks';
import { autocompleteUsername } from '../../core/discord/autocompleteUsername';
import { buttonRefresh } from '../../core/discord/buttonRefresh';
import { commandToURL } from '../../core/discord/commandToURL';
import { createLocalizedCommand } from '../../core/discord/createLocalizedCommand';
import { getCustomPeriodParams } from '../../core/discord/getCustomPeriodParams';
import { getFiltersFromButton } from '../../core/discord/getFiltersFromButton';
import { getFiltersFromCommand } from '../../core/discord/getFiltersFromCommand';
import { resolvePeriodFromButton } from '../../core/discord/resolvePeriodFromButton';
import { resolvePeriodFromCommand } from '../../core/discord/resolvePeriodFromCommand';
import { resolvePlayerFromButton } from '../../core/discord/resolvePlayerFromButton';
import { resolvePlayerFromCommand } from '../../core/discord/resolvePlayerFromCommand';
import type { CommandRegistry } from '../../events/interactionCreate';
import { renderBreakdown } from './render';

export const breakdownCommand = new Promise<CommandRegistry>(
  async (resolve) => {
    resolve({
      command: await addPeriodicFilterOptions(
        createLocalizedCommand('breakdown'),
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

        return [
          ...(await renderBreakdown(
            player,
            period,
            filters,
            interaction.locale,
          )),
          buttonRefresh(interaction, path),
          await getBlitzStarsLinkButton(player.region, player.id),
        ];
      },

      autocomplete: (interaction) => {
        autocompleteUsername(interaction);
        autocompleteTanks(interaction);
      },

      async button(interaction) {
        const player = await resolvePlayerFromButton(interaction);
        const period = resolvePeriodFromButton(player.region, interaction);
        const filters = getFiltersFromButton(interaction);

        return await renderBreakdown(
          player,
          period,
          filters,
          interaction.locale,
        );
      },
    });
  },
);
