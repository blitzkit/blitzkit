import { fetchTankNames, SEARCH_KEYS, TankType } from "@blitzkit/core";
import {
  type ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  type CacheType,
} from "discord.js";
import { go } from "fuzzysort";
import { tankNames } from "../blitzkit/nonBlockingPromises";
import { translator } from "../localization/translator";
import {
  DISCORD_CHOICES_MAX_NAME_SIZE,
  OVERFLOW_SUFFIX,
} from "./autocompleteClan/constants";

export const tankNamesTechTreeOnly = fetchTankNames().then((names) =>
  names.filter((tank) => tank.treeType === TankType.RESEARCHABLE)
);

export async function autocompleteTanks(
  interaction: AutocompleteInteraction<CacheType>,
  techTreeOnly = false,
  fields = ["tank"]
) {
  const { unwrap } = translator(interaction.locale);
  const focusedOption = interaction.options.getFocused(true);
  if (!fields.includes(focusedOption.name)) return;

  await interaction.respond(
    focusedOption.value
      ? await Promise.all(
          go(
            focusedOption.value,
            await (techTreeOnly ? tankNamesTechTreeOnly : tankNames),
            { keys: SEARCH_KEYS, limit: 10 }
          ).map(async (item) => {
            let name = unwrap(item.obj.searchableName);

            if (name.length > DISCORD_CHOICES_MAX_NAME_SIZE) {
              const overSize = name.length - DISCORD_CHOICES_MAX_NAME_SIZE;

              name = `${unwrap(item.obj.searchableName).slice(
                0,
                unwrap(item.obj.searchableName).length -
                  overSize -
                  OVERFLOW_SUFFIX.length
              )}${OVERFLOW_SUFFIX}`;
            }

            return {
              name,
              value: `${item.obj.id}`,
            } satisfies ApplicationCommandOptionChoiceData<string>;
          })
        )
      : []
  );
}
