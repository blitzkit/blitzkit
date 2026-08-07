import { assertSecret } from "@blitzkit/core";

interface EnvironmentConfig {
  paths: Record<string, string | null>;
  nodes: Record<string, string>;
  aliases: Record<string, string>;
}

export const environments = import.meta.glob(
  "../../../../environments/*.json",
  {
    eager: true,
    import: "default",
  },
) as Record<string, EnvironmentConfig>;
const root = "../../../../environments";

for (const key in environments) {
  const trimmed = key.slice(root.length + 1, -5);

  environments[trimmed] = environments[key];
  delete environments[key];
}

export function environmentConfig() {
  const environment = assertSecret(import.meta.env.ENVIRONMENT);

  if (!(environment in environments)) {
    throw new Error(`Invalid environment "${environment}"`);
  }

  return environments[environment];
}
