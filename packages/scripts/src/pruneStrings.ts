import { type TranslationTree } from "@blitzkit/i18n";
import locales from "@blitzkit/i18n/locales.json";
import { writeFile } from "fs/promises";

const ROOT = "@blitzkit/i18n/strings";
const WORKING_ROOT = "../../packages/i18n/strings";

const defaultStrings = require(`${ROOT}/${locales.default}.json`).default;
const nonDefaultLocales = locales.supported.filter(
  ({ locale }) => locale !== locales.default
);

function prune(defaultStrings: TranslationTree, strings: TranslationTree) {
  for (const key in strings) {
    if (key in defaultStrings) {
      if (typeof defaultStrings[key] === typeof strings[key]) {
        if (typeof strings[key] === "string") {
          if (
            // are equivalent regardless of %s flavor
            (defaultStrings[key] as string).replaceAll(/%s\d/g, "%s") ===
              (strings[key] as string).replaceAll(/%s\d/g, "%s") ||
            // string is empty
            strings[key] === "" ||
            // string has old flavor of %s
            strings[key].match(/%s([^\d]|$)/g) !== null
          ) {
            delete strings[key];
          }
        } else {
          prune(defaultStrings[key] as TranslationTree, strings[key]);
        }
      } else {
        delete strings[key];
      }
    } else {
      delete strings[key];
    }
  }

  return strings;
}

for (const locale of nonDefaultLocales) {
  console.log(`Pruning ${locale}...`);

  const strings = require(`${ROOT}/${locale}.json`).default;
  const pruned = prune(defaultStrings, strings);

  writeFile(`${WORKING_ROOT}/${locale}.json`, JSON.stringify(pruned, null, 2));
}
