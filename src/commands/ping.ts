import { SlashCommandBuilder } from 'discord.js';
import { CommandRegistry } from '../events/interactionCreate.js';

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,
  handlesInteraction: true,

  command: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check if the bot is alive'),

  async execute(interaction) {
    const executionStart = new Date().getTime();
    await interaction.editReply('Pong 🏓');
    const executionTime = new Date().getTime() - executionStart;
    interaction.editReply(`Pong 🏓 - ${executionTime}ms`);
  },
} satisfies CommandRegistry;
