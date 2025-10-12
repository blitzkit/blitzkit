import { I18nString } from "../../core/src";
import locales from "../locales.json";

export function unwrapper(locale = locales.default) {
  return function (i18nString: I18nString) {
    if (locale in i18nString.locales) {
      return i18nString.locales[locale];
    }

    return i18nString.locales[locales.default];
  };
}
