import { assertSecret } from "@blitzkit/core";
import {
  AttachmentBuilder,
  AutocompleteInteraction,
  ButtonBuilder,
  ButtonInteraction,
  type CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  type Interaction,
  REST,
  Routes,
  SlashCommandBuilder,
  type SlashCommandOptionsOnlyBuilder,
  type SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { aboutCommand } from "../../commands/about";
import { breakdownCommand } from "../../commands/breakdown";
import { debugCommand } from "../../commands/debug";
import { evolutionCommand } from "../../commands/evolution";
import { fullStatsCommand } from "../../commands/fullStats";
import { inactiveCommand } from "../../commands/inactive";
import { verifyCommand } from "../../commands/link";
import { ownedTanksCommand } from "../../commands/ownedTanks";
import { permissionsCommand } from "../../commands/permissions";
import { pingCommand } from "../../commands/ping";
import { playerInfoCommand } from "../../commands/playerInfo";
import { ratingCommand } from "../../commands/rating";
import { ratingLeaderboardCommand } from "../../commands/ratingLeaderboard";
import { replayCommand } from "../../commands/replay";
import { researchCommand } from "../../commands/research";
import { searchClansCommand } from "../../commands/searchClans";
import { searchPlayersCommand } from "../../commands/searchPlayers";
import { statsCommand } from "../../commands/stats";
import { todayCommand } from "../../commands/today";
import { RenderConfiguration } from "../../core/blitzkit/renderConfiguration";
import { handleAutocomplete } from "./handlers/autocomplete";
import { handleButton } from "./handlers/button";
import { handleChatInputCommand } from "./handlers/chatInputCommand";

export type InteractionRawReturnable =
  | string
  | EmbedBuilder
  | ButtonBuilder
  | AttachmentBuilder
  | RenderConfiguration
  | React.JSX.Element
  | null;
export type InteractionIterableReturnable =
  | InteractionRawReturnable
  | InteractionRawReturnable[];
export type InteractionReturnable =
  | InteractionIterableReturnable
  | Promise<InteractionIterableReturnable>;

interface CommandRegistryBase {
  command:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | SlashCommandOptionsOnlyBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

  autocomplete?: (interaction: AutocompleteInteraction<CacheType>) => void;
  button?: (interaction: ButtonInteraction<CacheType>) => InteractionReturnable;
}

interface CommandRegistryImplicit extends CommandRegistryBase {
  handlesInteraction: true;
  handler: (interaction: ChatInputCommandInteraction<CacheType>) => void;
}

interface CommandRegistryExplicit extends CommandRegistryBase {
  handlesInteraction?: false;
  handler: (
    interaction: ChatInputCommandInteraction<CacheType>,
  ) => InteractionReturnable;
}

export type CommandRegistry = CommandRegistryImplicit | CommandRegistryExplicit;

export const commandsArray: Promise<CommandRegistry>[] = [
  // auctionCommand,
  permissionsCommand,
  debugCommand,
  aboutCommand,
  inactiveCommand,
  ownedTanksCommand,
  playerInfoCommand,
  searchClansCommand,
  searchPlayersCommand,
  fullStatsCommand,
  breakdownCommand,
  verifyCommand,
  pingCommand,
  evolutionCommand,
  statsCommand,
  ratingLeaderboardCommand,
  todayCommand,
  researchCommand,
  ratingCommand,
  replayCommand,
];

export const commands: Record<string, CommandRegistry> = {};
const commandsFulfilled: CommandRegistry[] = [];

let index = 0;
for (const registry of await Promise.allSettled(commandsArray)) {
  if (registry.status === "rejected") {
    console.warn(`Command ${index} rejected`, registry.reason);
    continue;
  }

  commandsFulfilled.push(registry.value);
  commands[registry.value.command.name] = registry.value;
  index++;
}

const rest = new REST().setToken(assertSecret(import.meta.env.DISCORD_TOKEN));
const body = commandsFulfilled.map((registry) => registry.command.toJSON());
const applicationCommandsRoute = Routes.applicationCommands(
  assertSecret(import.meta.env.DISCORD_CLIENT_ID),
);

await rest.put(applicationCommandsRoute, { body });

export async function interactionCreate(interaction: Interaction<CacheType>) {
  if (interaction.isAutocomplete()) {
    handleAutocomplete(interaction);
  } else if (interaction.isChatInputCommand()) {
    handleChatInputCommand(interaction);
  } else if (interaction.isButton()) {
    handleButton(interaction);
  }
}
