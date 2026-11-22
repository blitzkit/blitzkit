import locales from "@blitzkit/i18n/locales.json";

export function getCurrentPathLocale() {
  const pathname = window.location.pathname;

  return (
    locales.supported.find(
      ({ locale }) =>
        pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
    )?.locale ?? locales.default
  );
}
