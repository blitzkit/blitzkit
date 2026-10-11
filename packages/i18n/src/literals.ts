export function literals(
  string: string,
  literals?: Record<string, string | number | undefined>,
) {
  for (const key in literals) {
    string = string.replaceAll(`{${key}}`, `${literals[key]}`);
  }

  return string;
}

export function literalsArray<Type, Literal = Type | string>(
  string: string,
  literals?: Record<string, Literal>,
) {
  if (!literals) return [string];

  let array: (string | Literal)[] = [string];

  for (const key in literals) {
    const value = literals[key];
    const next: (string | Literal)[] = [];

    for (const chunk of array) {
      if (typeof chunk !== "string") {
        next.push(chunk);
        continue;
      }

      const parts = chunk.split(`{${key}}`);

      for (let index = 0; index < parts.length; index++) {
        if (parts[index]) next.push(parts[index]);

        if (index < parts.length - 1) {
          next.push(value);
        }
      }
    }

    array = next;
  }

  return array;
}
