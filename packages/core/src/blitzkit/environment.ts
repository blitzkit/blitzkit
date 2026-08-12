import { assertSecret } from "@blitzkit/core";

interface EnvironmentConfig {
  robots: boolean;
  canonical: string;
  paths: Record<string, string | null>;
  nodes: Record<string, string>;
  aliases: Record<string, string>;
}

let hasReadEnvironments = false;
const environments: Record<string, EnvironmentConfig> = {};

/**
 * This is set up this way to avoid errors in runtimes where
 * `import.meta.glob` does not exist.
 */
function readEnvironments() {
  if (hasReadEnvironments) return;

  hasReadEnvironments = true;

  const glob = import.meta.glob("../../../../environments/*.json", {
    eager: true,
    import: "default",
  }) as Record<string, EnvironmentConfig>;
  const root = "../../../../environments";

  for (const key in glob) {
    const trimmed = key.slice(root.length + 1, -5);

    environments[trimmed] = glob[key];
    delete environments[key];
  }
}

export function environmentConfig() {
  readEnvironments();

  const environment = assertSecret(import.meta.env.PUBLIC_ENVIRONMENT);

  if (!(environment in environments)) {
    throw new Error(`Invalid environment "${environment}"`);
  }

  return environments[environment];
}
