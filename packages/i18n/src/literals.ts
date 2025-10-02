import { assertSecret } from "@blitzkit/core";

const dev = assertSecret(import.meta.env.DEV);

export function literals(
  string: string,
  literals?: Record<string, string | number | undefined>
) {
  for (const key in literals) {
    const mutated = string.replaceAll(`{${key}}`, `${literals[key]}`);

    if (dev && mutated === string) {
      console.warn(`Could not find literal {${key}} in string "${string}"`);
    }

    string = mutated;
  }

  return string;
}
