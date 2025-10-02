import { literals } from "@blitzkit/i18n";
import { createLocalizedCommand } from "../core/discord/createLocalizedCommand";
import { translator } from "../core/localization/translator";
import { CommandRegistry } from "../events/interactionCreate";

export const permissionsCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    command: createLocalizedCommand("permissions"),

    async handler(interaction) {
      const { strings } = translator(interaction.locale);
      // friday the 13th permissions easter egg
      const isFridayThe13th =
        new Date().getDay() === 5 && new Date().getDate() === 13;
      const permissions = [
        [
          interaction.appPermissions?.has("ViewChannel"),
          strings.bot.commands.permissions.body.view_channels,
        ],
        [
          interaction.appPermissions?.has("ReadMessageHistory"),
          strings.bot.commands.permissions.body.read_message_history,
        ],
        [
          interaction.appPermissions?.has("AttachFiles"),
          strings.bot.commands.permissions.body.attach_files,
        ],
        [
          interaction.appPermissions?.has("UseExternalEmojis"),
          strings.bot.commands.permissions.body.external_emojis,
        ],
      ];
      const body = permissions
        .map(([hasPermission, description]) => {
          if (hasPermission) {
            return `${isFridayThe13th ? "😇" : "✅"} ${description}`;
          } else {
            return `${isFridayThe13th ? "💀" : "❌"} ${description}`;
          }
        })
        .join("\n");

      return literals(strings.bot.commands.permissions.body.title, { body });
    },
  });
});
