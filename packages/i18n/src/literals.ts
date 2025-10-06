import { assertSecret } from "@blitzkit/core";

export function literals(
  string: string,
  literals?: Record<string, string | number | undefined>
) {
  for (const key in literals) {
    const mutated = string.replaceAll(`{${key}}`, `${literals[key]}`);

    if (import.meta.env.DEV && mutated === string) {
      console.warn(`Could not find literal {${key}} in string "${string}"`);
    }

    string = mutated;
  }

  return string;
}
