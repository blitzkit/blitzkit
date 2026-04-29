import { api } from "../core/api/dynamic";
import { useAwait } from "./useAwait";
import { useLocale } from "./useLocale";

export function useGameStrings(groups: string | string[]) {
  const resolved = typeof groups === "string" ? [groups] : groups;
  const locale = useLocale();
  const strings = useAwait(
    async () => {
      const accumulated: Record<string, string> = {};

      await Promise.all(
        resolved.map(async (group) => {
          const strings = await api.groupedGameStrings(locale, group, true);
          Object.assign(accumulated, strings);
        }),
      );

      return accumulated;
    },
    `game-strings-${locale}-${resolved.sort().join("-")}`,
  );

  return strings;
}
