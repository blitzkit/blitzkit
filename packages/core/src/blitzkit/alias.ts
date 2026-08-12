import { environmentConfig } from "@blitzkit/core";

export function alias(alias: string, path: string) {
  const environment = environmentConfig();

  if (!(alias in environment.aliases)) {
    throw new Error(`Invalid alias "${alias}"`);
  }

  const base = environment.aliases[alias];

  return `${base}${path}`;
}
