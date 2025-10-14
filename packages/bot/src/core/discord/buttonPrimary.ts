import {
  ButtonBuilder,
  ButtonStyle,
  type ComponentEmojiResolvable,
} from "discord.js";

export function buttonPrimary(
  id: string,
  label: string,
  emoji?: ComponentEmojiResolvable
) {
  const button = new ButtonBuilder()
    .setCustomId(id)
    .setStyle(ButtonStyle.Primary)
    .setLabel(label);

  if (emoji) button.setEmoji(emoji);

  return button;
}
