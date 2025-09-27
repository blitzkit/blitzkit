import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  EmbedBuilder,
  InteractionEditReplyOptions,
  InteractionReplyOptions,
  MessageEditOptions,
} from "discord.js";
import { InteractionReturnable } from "../../events/interactionCreate";
import { Writeable } from "../../types/writable";
import { jsxToPngThreaded } from "../blitzkit/jsxToPngThreaded";
import { RenderConfiguration } from "../blitzkit/renderConfiguration";

export async function normalizeInteractionReturnable(
  returnable: InteractionReturnable
) {
  const images: [number, Buffer][] = [];
  const reply: InteractionEditReplyOptions &
    InteractionReplyOptions &
    MessageEditOptions = {};
  const awaitedReturnable = await returnable;
  const normalizedReturnable = Array.isArray(awaitedReturnable)
    ? awaitedReturnable
    : [awaitedReturnable];
  let renderConfiguration = new RenderConfiguration();

  await Promise.all(
    normalizedReturnable.map(async (item, index) => {
      if (typeof item === "string") {
        reply.content = item;
      } else if (item instanceof EmbedBuilder) {
        if (!reply.embeds) reply.embeds = [];
        (reply.embeds as Writeable<typeof reply.embeds>).push(item);
      } else if (item instanceof ButtonBuilder) {
        if (!reply.components)
          reply.components = [new ActionRowBuilder<ButtonBuilder>()];
        (reply.components[0] as ActionRowBuilder<ButtonBuilder>).addComponents(
          item
        );
      } else if (item instanceof AttachmentBuilder) {
        if (!reply.files) reply.files = [];
        (reply.files as Writeable<typeof reply.files>).push(item);
      } else if (item instanceof RenderConfiguration) {
        renderConfiguration = item;
      } else if (item === null) {
        return;
      } else {
        const image = await jsxToPngThreaded(item, renderConfiguration);
        images.push([index, image]);
      }
    })
  );

  if (images.length > 0) {
    images.sort(([a], [b]) => b - a);
    if (!reply.files) reply.files = [];
    images.forEach(([, image]) =>
      (reply.files as Writeable<typeof reply.files>)?.push(image)
    );
  }

  return reply;
}
