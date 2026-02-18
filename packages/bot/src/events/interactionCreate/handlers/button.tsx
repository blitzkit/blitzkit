import { ButtonInteraction, CacheType } from "discord.js";
import { commands } from "..";
import { normalizeInteractionReturnable } from "../../../core/discord/normalizeInteractionReturnable";

export async function handleButton(interaction: ButtonInteraction<CacheType>) {
  await interaction.deferUpdate();

  const url = new URL(`https://example.com/${interaction.customId}`);
  const commandName = url.pathname.split("/")[1];
  const button = commands[commandName]?.button;

  if (!button) {
    throw new Error(`Button handler not found for "${commandName}"`);
  }

  if (interaction.message.interaction?.user.id !== interaction.user.id) {
    interaction.followUp({
      ephemeral: true,
      content: "You are not the author of this command.",
    });
    return;
  }

  await interaction.message.edit(
    await normalizeInteractionReturnable(button(interaction)),
  );
}
