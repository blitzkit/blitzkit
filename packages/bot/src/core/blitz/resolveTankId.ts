import { SEARCH_KEYS } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import { Locale } from "discord.js";
import { go } from "fuzzysort";
import markdownEscape from "markdown-escape";
import { tankDefinitions, tankNames } from "../blitzkit/nonBlockingPromises";
import { UserError } from "../blitzkit/userError";
import { tankNamesTechTreeOnly } from "../discord/autocompleteTanks";
import { translator } from "../localization/translator";

export async function resolveTankId(
  tank: string | number,
  locale: Locale,
  techTreeOnly = false
) {
  const { strings } = translator(locale);
  const number = typeof tank === "string" ? Number(tank) : tank;

  if (Number.isNaN(number)) {
    const searchResult = go(
      `${tank}`,
      await (techTreeOnly ? tankNamesTechTreeOnly : tankNames),
      { keys: SEARCH_KEYS, limit: 1 }
    );

    if (searchResult.length === 0) {
      throw new UserError(
        literals(strings.bot.common.errors.tank_name_not_found, {
          search: markdownEscape(`${tank}`),
        })
      );
    } else {
      return searchResult[0].obj.id;
    }
  } else {
    const awaitedTankDefinitions = await tankDefinitions;

    if (awaitedTankDefinitions.tanks[number]) {
      return number;
    } else {
      throw new UserError(
        literals(strings.bot.common.errors.tank_id_not_found, {
          search: number,
        })
      );
    }
  }
}
