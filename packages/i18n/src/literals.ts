export function literals(
  string: string,
  literals?: Record<string, string | number>
) {
  for (const key in literals) {
    string = string.replaceAll(`{${key}}`, `${literals[key]}`);
  }

  return string;
}
