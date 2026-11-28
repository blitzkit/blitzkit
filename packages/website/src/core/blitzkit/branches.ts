import { assertSecret } from "@blitzkit/core";
import type { Strings } from "@blitzkit/i18n";

export function resolveBranchName(strings: Strings) {
  const environment = assertSecret(import.meta.env.PUBLIC_ENVIRONMENT);

  if (environment === "production") return undefined;

  return strings.common.branches[
    environment as keyof typeof strings.common.branches
  ];
}
