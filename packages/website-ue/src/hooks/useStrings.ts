import { api } from "../core/api/dynamic";
import { useAwait } from "./useAwait";
import { useLocale } from "./useLocale";

export function useStrings() {
  const locale = useLocale();
  const strings = useAwait(() => api.strings(locale), `strings-${locale}`);
  return strings;
}
