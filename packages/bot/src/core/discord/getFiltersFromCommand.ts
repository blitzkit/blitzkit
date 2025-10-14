import { ChatInputCommandInteraction } from 'discord.js';
import { resolveTankId } from '../blitz/resolveTankId';
import type { StatFilters } from '../blitzstars/filterStats';

export async function getFiltersFromCommand(
  interaction: ChatInputCommandInteraction,
) {
  const nationRaw = interaction.options.getString('nation');
  const tierRaw = interaction.options.getString('tier');
  const classRaw = interaction.options.getString('class');
  const typeRaw = interaction.options.getString('type');
  const tankRaw = interaction.options.getString('tank');

  return {
    nation: nationRaw ?? undefined,
    tier: tierRaw === null ? undefined : Number(tierRaw),
    class: classRaw === null ? undefined : Number(classRaw),
    type: typeRaw === null ? undefined : Number(typeRaw),
    tank:
      tankRaw === null
        ? undefined
        : await resolveTankId(tankRaw, interaction.locale),
  } satisfies StatFilters;
}
