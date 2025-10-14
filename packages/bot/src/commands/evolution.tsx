import { emblemURL, getAccountInfo, getClanAccountInfo } from "@blitzkit/core";
import { Locale, SlashCommandSubcommandGroupBuilder } from "discord.js";
import { CommandWrapper } from "../components/CommandWrapper";
import * as Graph from "../components/Graph";
import { LineColor } from "../components/Graph/components/Line/constants";
import { NoData } from "../components/NoData";
import { TitleBar } from "../components/TitleBar";
import { resolveTankId } from "../core/blitz/resolveTankId";
import { getBlitzStarsLinkButton } from "../core/blitzstars/getBlitzStarsLinkButton";
import { getPlayerHistories } from "../core/blitzstars/getPlayerHistories";
import { getTankHistories } from "../core/blitzstars/getTankHistories";
import { addPeriodSubCommands } from "../core/discord/addPeriodSubCommands";
import { addTankChoices } from "../core/discord/addTankChoices";
import { addUsernameChoices } from "../core/discord/addUsernameChoices";
import { autocompleteTanks } from "../core/discord/autocompleteTanks";
import { autocompleteUsername } from "../core/discord/autocompleteUsername";
import { buttonRefresh } from "../core/discord/buttonRefresh";
import { commandToURL } from "../core/discord/commandToURL";
import { createLocalizedCommand } from "../core/discord/createLocalizedCommand";
import { getCustomPeriodParams } from "../core/discord/getCustomPeriodParams";
import { resolvePeriodFromButton } from "../core/discord/resolvePeriodFromButton";
import {
  type ResolvedPeriod,
  resolvePeriodFromCommand,
} from "../core/discord/resolvePeriodFromCommand";
import { resolvePlayerFromButton } from "../core/discord/resolvePlayerFromButton";
import {
  type ResolvedPlayer,
  resolvePlayerFromCommand,
} from "../core/discord/resolvePlayerFromCommand";
import type { CommandRegistry } from "../events/interactionCreate";

type EvolutionStatType = "player" | "tank";

async function render(
  { region, id }: ResolvedPlayer,
  { start, end, name }: ResolvedPeriod,
  type: "player" | "tank",
  tankId: number | null,
  locale: Locale
) {
  const accountInfo = await getAccountInfo(region, id);
  const clan = (await getClanAccountInfo(region, id, ["clan"]))?.clan;
  const logo = clan ? emblemURL(clan.emblem_set_id) : undefined;
  const histories = await (type === "player"
    ? getPlayerHistories(region, id, {
        start,
        end,
        includeLatestHistories: true,
        includePreviousHistories: true,
      })
    : getTankHistories(region, id, locale, {
        tankId: tankId!,
        start,
        end,
        includeLatestHistories: true,
        includePreviousHistories: true,
      }));
  const plot = histories.map(
    (history) =>
      [
        history.all.battles,
        (history.all.wins / history.all.battles) * 100,
      ] as Graph.PlotItem
  );
  const times = histories.map((history) => history.last_battle_time);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const ys = plot.map(([, y]) => y);
  const xs = plot.map(([x]) => x);
  const maxY = Math.max(...ys);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const minX = Math.min(...xs);

  return (
    <CommandWrapper>
      <TitleBar title={accountInfo.nickname} image={logo} description={name} />

      {plot.length > 0 && (
        <Graph.Root
          verticalMargin={{
            min: minY,
            max: maxY,
            suffix: "%",
            precision: 2,
          }}
          horizontalMargin={{
            min: minX,
            max: maxX,
            precision: 0,
          }}
          xMinLabel={new Date(minTime * 1000).toLocaleDateString(locale)}
          xMaxLabel={new Date(maxTime * 1000).toLocaleDateString(locale)}
        >
          {Graph.Line({
            color: LineColor.Red,
            plot: plot,
            minY,
            maxY,
          })}
        </Graph.Root>
      )}

      {plot.length === 0 && <NoData type="battles_in_period" locale={locale} />}
    </CommandWrapper>
  );
}

export const evolutionCommand = new Promise<CommandRegistry>(
  async (resolve) => {
    resolve({
      command: createLocalizedCommand("evolution", [
        {
          group: "player",
          modify(option: SlashCommandSubcommandGroupBuilder) {
            addPeriodSubCommands(option, (option) =>
              option.addStringOption(addUsernameChoices)
            );
          },
        },
        {
          group: "tank",
          modify(option: SlashCommandSubcommandGroupBuilder) {
            addPeriodSubCommands(option, (option) =>
              option
                .addStringOption(addTankChoices)
                .addStringOption(addUsernameChoices)
            );
          },
        },
      ]),

      async handler(interaction) {
        const commandGroup =
          interaction.options.getSubcommandGroup() as EvolutionStatType;
        const player = await resolvePlayerFromCommand(interaction);
        const period = resolvePeriodFromCommand(player.region, interaction);
        const tankIdRaw = interaction.options.getString("tank")!;
        const tankId =
          commandGroup === "tank"
            ? await resolveTankId(tankIdRaw, interaction.locale)
            : null;
        const path = commandToURL(interaction, {
          ...player,
          ...getCustomPeriodParams(interaction),
          tankId,
        });

        return [
          await render(
            player,
            period,
            commandGroup,
            tankId,
            interaction.locale
          ),
          buttonRefresh(interaction, path),
          await getBlitzStarsLinkButton(
            player.region,
            player.id,
            tankId ?? undefined
          ),
        ];
      },

      autocomplete: (interaction) => {
        autocompleteUsername(interaction);
        autocompleteTanks(interaction);
      },

      async button(interaction) {
        const url = new URL(`https://example.com/${interaction.customId}`);
        const path = url.pathname.split("/");
        const commandGroup = path[2] as EvolutionStatType;
        const player = await resolvePlayerFromButton(interaction);
        const period = resolvePeriodFromButton(player.region, interaction);

        return await render(
          player,
          period,
          commandGroup,
          parseInt(url.searchParams.get("tankId") ?? "0") || null,
          interaction.locale
        );
      },
    });
  }
);
