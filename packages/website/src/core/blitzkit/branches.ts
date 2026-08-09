import { assertSecret } from "@blitzkit/core";
import { STRINGS } from "@blitzkit/i18n";
import locales from "@blitzkit/i18n/locales.json";

export function resolveBranchName(locale: string = locales.default) {
  const strings = STRINGS[locale];
  const environment = assertSecret(import.meta.env.PUBLIC_ENVIRONMENT);

  if (environment === "production") return undefined;

  return strings.common.branches[
    environment as keyof typeof strings.common.branches
  ];
}
