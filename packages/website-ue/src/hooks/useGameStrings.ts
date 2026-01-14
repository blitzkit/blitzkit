import { api } from "../core/api/dynamic";
import { useAwait } from "./useAwait";
import { useLocale } from "./useLocale";

export function useGameStrings(group: string) {
  const { locale } = useLocale();
  const strings = useAwait(
    () => api.groupedGameStrings(locale, group, true),
    `game-strings-${locale}-${group}`
  );

  return strings;
}
