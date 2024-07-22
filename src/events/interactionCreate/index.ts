import {
  AttachmentBuilder,
  AutocompleteInteraction,
  ButtonBuilder,
  ButtonInteraction,
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Interaction,
  REST,
  Routes,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { aboutCommand } from '../../commands/about';
import { breakdownCommand } from '../../commands/breakdown';
import { debugCommand } from '../../commands/debug';
import { evolutionCommand } from '../../commands/evolution';
import { fullStatsCommand } from '../../commands/fullStats';
import { inactiveCommand } from '../../commands/inactive';
import { verifyCommand } from '../../commands/link';
import { ownedTanksCommand } from '../../commands/ownedTanks';
import { permissionsCommand } from '../../commands/permissions';
import { pingCommand } from '../../commands/ping';
import { playerInfoCommand } from '../../commands/playerInfo';
import { ratingCommand } from '../../commands/rating';
import { ratingLeaderboardCommand } from '../../commands/ratingLeaderboard';
import { replayCommand } from '../../commands/replay';
import { researchCommand } from '../../commands/research';
import { searchClansCommand } from '../../commands/searchClans';
import { searchPlayersCommand } from '../../commands/searchPlayers';
import { statsCommand } from '../../commands/stats';
import { todayCommand } from '../../commands/today';
import isDev from '../../core/blitzkit/isDev';
import { RenderConfiguration } from '../../core/blitzkit/renderConfiguration';
import { secrets } from '../../core/blitzkit/secrets';
import handleAutocomplete from './handlers/autocomplete';
import handleButton from './handlers/button';
import handleChatInputCommand from './handlers/chatInputCommand';

export type InteractionRawReturnable =
  | string
  | EmbedBuilder
  | ButtonBuilder
  | AttachmentBuilder
  | RenderConfiguration
  | JSX.Element
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
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

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

export const COMMANDS_RAW: Promise<CommandRegistry>[] = [
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

export const commands = Promise.allSettled(COMMANDS_RAW).then((rawCommands) => {
  return rawCommands.reduce<Record<string, CommandRegistry>>(
    (commands, registry, index) => {
      if (registry.status === 'rejected') {
        console.warn(
          `Command ${index} failed to load; skipping...`,
          registry.reason,
        );

        return commands;
      }
      if (isDev()) registry.value.command.setDefaultMemberPermissions(0);
      return { ...commands, [registry.value.command.name]: registry.value };
    },
    {},
  );
});

const rest = new REST().setToken(secrets.DISCORD_TOKEN);

commands.then((awaitedCommands) => {
  const body = Object.values(awaitedCommands).map((registry) =>
    registry.command.toJSON(),
  );

  rest.put(Routes.applicationCommands(secrets.DISCORD_CLIENT_ID), { body });
});

export default async function interactionCreate(
  interaction: Interaction<CacheType>,
) {
  if (interaction.isAutocomplete()) {
    handleAutocomplete(interaction);
  } else if (interaction.isChatInputCommand()) {
    handleChatInputCommand(interaction);
  } else if (interaction.isButton()) {
    handleButton(interaction);
  }
}
