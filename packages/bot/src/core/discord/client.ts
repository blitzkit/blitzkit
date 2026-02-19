import { Client, GatewayIntentBits } from "discord.js";
import { interactionCreate } from "../../events/interactionCreate";
import { ready } from "../../events/ready";

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
})
  .on("clientReady", ready)
  .on("interactionCreate", interactionCreate);
