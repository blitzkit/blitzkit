import { assertSecret } from "@blitzkit/core";
import { STRINGS } from "@blitzkit/i18n";
import locales from "@blitzkit/i18n/locales.json";

export function resolveBranchName(locale: string = locales.default) {
  if (!(locale in STRINGS)) throw new Error(`Unsupported locale: ${locale}`);

  const strings = STRINGS[locale];
  const secret = assertSecret(import.meta.env.PUBLIC_BRANCH);

  if (
    assertSecret(import.meta.env.MODE) === "development" &&
    secret === "dev"
  ) {
    return strings.common.branches.local;
  } else {
    return (strings.common.branches as Record<string, string>)[secret] as
      | string
      | undefined;
  }
}
