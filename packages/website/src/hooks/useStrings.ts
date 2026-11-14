import { api } from "../api/dynamic";
import { useAwait } from "./useAwait";
import { useLocale } from "./useLocale";

export function useStrings() {
  const locale = useLocale();
  const strings = useAwait(() => api.strings(locale), `strings-${locale}`);
  return strings;
}
