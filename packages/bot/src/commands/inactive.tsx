import { getAccountInfo, getClanInfo } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import { Locale } from "discord.js";
import { CommandWrapper } from "../components/CommandWrapper";
import { GenericStats } from "../components/GenericStats";
import { NoData } from "../components/NoData";
import { TitleBar } from "../components/TitleBar";
import { addClanChoices } from "../core/discord/addClanChoices";
import { autocompleteClan } from "../core/discord/autocompleteClan";
import { createLocalizedCommand } from "../core/discord/createLocalizedCommand";
import { localizationObject } from "../core/discord/localizationObject";
import { resolveClanFromCommand } from "../core/discord/resolveClanFromCommand";
import { translator } from "../core/localization/translator";
import { CommandRegistry } from "../events/interactionCreate";

const DEFAULT_THRESHOLD = 7;

export const inactiveCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    command: createLocalizedCommand("inactive")
      .addStringOption(addClanChoices)
      .addNumberOption((option) => {
        const { strings } = translator(Locale.EnglishUS);

        return option
          .setName("threshold")
          .setNameLocalizations(
            localizationObject(
              (strings) => strings.bot.commands.inactive.options.threshold.name,
              undefined,
              true
            )
          )
          .setDescription(
            strings.bot.commands.inactive.options.threshold.description
          )
          .setDescriptionLocalizations(
            localizationObject(
              (strings) =>
                strings.bot.commands.inactive.options.threshold.description
            )
          )
          .setMinValue(0);
      }),

    async handler(interaction) {
      const { strings } = translator(interaction.locale);
      const { region, id } = await resolveClanFromCommand(interaction);
      const threshold =
        interaction.options.getNumber("threshold")! ?? DEFAULT_THRESHOLD;
      const time = new Date().getTime() / 1000;
      const clanInfo = await getClanInfo(region, id);
      const accountInfo = await getAccountInfo(region, clanInfo.members_ids);
      const inactive = accountInfo
        .map(
          (account) =>
            [
              account.nickname,
              (time - account.last_battle_time) / 60 / 60 / 24,
            ] as [string, number]
        )
        .filter(([, inactiveDays]) => inactiveDays >= threshold)
        .sort((a, b) => b[1] - a[1])
        .map(
          ([name, days]) =>
            [
              name,
              literals(strings.bot.commands.inactive.body.listing, {
                days: days.toFixed(0),
              }),
            ] as [string, string]
        );
      const hasInactiveMembers = inactive.length > 0;

      return (
        <CommandWrapper>
          <TitleBar
            title={clanInfo.name}
            image={`https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clanInfo.emblem_set_id}.png`}
            description={`${literals(
              strings.bot.commands.inactive.body.subtitle,
              { days: threshold }
            )} • ${new Date().toLocaleDateString(interaction.locale)}`}
          />

          {!hasInactiveMembers && (
            <NoData type="players_in_period" locale={interaction.locale} />
          )}
          {hasInactiveMembers && <GenericStats stats={inactive} />}
        </CommandWrapper>
      );
    },

    autocomplete: autocompleteClan,
  });
});
