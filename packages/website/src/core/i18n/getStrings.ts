import { STRINGS } from "@blitzkit/i18n";

export function getStrings(locale: string) {
  if (locale in STRINGS) return STRINGS[locale];
  throw new Error(`Unsupported locale: ${locale}`);
}
