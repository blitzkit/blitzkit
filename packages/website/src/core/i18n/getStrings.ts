import { STRINGS } from "@blitzkit/i18n";
import locales from "@blitzkit/i18n/locales.json";

export function getStrings(locale: string = locales.default) {
  if (locale in STRINGS) return STRINGS[locale];
  throw new Error(`Unsupported locale: ${locale}`);
}
