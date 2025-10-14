import { literals } from "@blitzkit/i18n";
import { createLocalizedCommand } from "../core/discord/createLocalizedCommand";
import { translator } from "../core/localization/translator";
import type { CommandRegistry } from "../events/interactionCreate";

export const pingCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    handlesInteraction: true,

    command: createLocalizedCommand("ping", [
      { subcommand: "blitzkit" },
      { subcommand: "wotb" },
    ]),

    async handler(interaction) {
      const { strings } = translator(interaction.locale);
      const subcommand = interaction.options.getSubcommand();
      const executionStart = Date.now();

      if (subcommand === "blitzkit") {
        await interaction.editReply(strings.bot.commands.ping.body.pong);
      } else {
        await fetch("https://api.wotblitz.com/");
      }

      const executionTime = Date.now() - executionStart;
      interaction.editReply(
        literals(strings.bot.commands.ping.body.pong_with_time, {
          time: executionTime.toFixed(0),
        })
      );
    },
  });
});
