import locales from "@blitzkit/i18n/locales.json";
import { getCurrentPathLocale } from "./getCurrentPathLocale";

// keeps the current page, swapping only the locale prefix
export function navigateToLocale(locale: string) {
  const pathname = window.location.pathname;
  const currentLocale = getCurrentPathLocale();
  const rawPath =
    currentLocale === locales.default
      ? pathname
      : pathname.slice(`/${currentLocale}`.length) || "/";

  window.location.pathname = `${
    locale === locales.default ? "" : `/${locale}`
  }${rawPath}`;
}
