import locales from "@blitzkit/i18n/locales.json";
import { api } from "../../api/dynamic";

export interface LocaleOption {
  locale: string;
  flag: string;
  name: string;
}

// each locale is named in its own language; run at build time so clients never fetch every locale's strings
export async function getLocaleOptions() {
  return Promise.all(
    locales.supported.map(async ({ locale, flag }) => {
      const strings = await api.strings(locale);
      const name = (strings.common.locales as Record<string, string>)[locale];

      return { locale, flag, name } satisfies LocaleOption;
    }),
  );
}
