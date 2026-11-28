import locales from "@blitzkit/i18n/locales.json";
import { I18nString } from "@blitzkit/protos";

export function unwrapper(locale: string) {
  return function (i18nString?: I18nString) {
    if (i18nString === undefined) {
      throw new Error("i18nString is undefined");
    }

    if (locale in i18nString.locales) {
      return i18nString.locales[locale];
    }

    return i18nString.locales[locales.default];
  };
}
