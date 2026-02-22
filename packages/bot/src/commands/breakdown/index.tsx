import { addPeriodicFilterOptions } from "../../core/discord/addPeriodicFilterOptions";
import { addUsernameChoices } from "../../core/discord/addUsernameChoices";
import { autocompleteTanks } from "../../core/discord/autocompleteTanks";
import { autocompleteUsername } from "../../core/discord/autocompleteUsername";
import { createLocalizedCommand } from "../../core/discord/createLocalizedCommand";
import { getFiltersFromButton } from "../../core/discord/getFiltersFromButton";
import { resolvePeriodFromButton } from "../../core/discord/resolvePeriodFromButton";
import { resolvePlayerFromButton } from "../../core/discord/resolvePlayerFromButton";
import { translator } from "../../core/localization/translator";
import type { CommandRegistry } from "../../events/interactionCreate";
import { renderBreakdown } from "./render";

export const breakdownCommand = new Promise<CommandRegistry>(
  async (resolve) => {
    resolve({
      command: await addPeriodicFilterOptions(
        createLocalizedCommand("breakdown"),
        (option) => option.addStringOption(addUsernameChoices),
      ),

      async handler(interaction) {
        const { strings } = translator(interaction.locale);
        return strings.bot.commands.dead;

        // const player = await resolvePlayerFromCommand(interaction);
        // const period = resolvePeriodFromCommand(player.region, interaction);
        // const filters = await getFiltersFromCommand(interaction);
        // const path = commandToURL(interaction, {
        //   ...player,
        //   ...getCustomPeriodParams(interaction),
        //   ...filters,
        // });

        // return [
        //   ...(await renderBreakdown(
        //     player,
        //     period,
        //     filters,
        //     interaction.locale,
        //   )),
        //   buttonRefresh(interaction, path),
        //   await getBlitzStarsLinkButton(player.region, player.id),
        // ];
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
