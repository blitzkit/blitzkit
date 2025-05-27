import locales from '@blitzkit/i18n/locales.json' with { type: 'json' };

export function getBestLocale() {
  const desiredLocale =
    localStorage.getItem('preferred-locale') ??
    navigator.language.split('-')[0];
  const isSupported = locales.supported.some(
    ({ locale }) => locale === desiredLocale,
  );
  const isDefault = desiredLocale === locales.default;

  if (!isSupported || isDefault) return undefined;

  return desiredLocale;
}
