import { unwrapper } from "@blitzkit/i18n";
import { useLocale } from "./useLocale";

export function useUnwrapper() {
  const locale = useLocale();
  const unwrap = unwrapper(locale);

  return unwrap;
}
