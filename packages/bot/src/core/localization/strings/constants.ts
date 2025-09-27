import locales from "@blitzkit/i18n/locales.json";
import { Locale } from "discord.js";

const SUPPORTED_LOCALES_DISCORD_MAP: Record<string, Locale> = {
  en: Locale.EnglishUS,
  es: Locale.SpanishES,
  pt: Locale.PortugueseBR,
  ru: Locale.Russian,
  uk: Locale.Ukrainian,
  zh: Locale.ChineseCN,
  fr: Locale.French,
  ja: Locale.Japanese,
  pl: Locale.Polish,
};

export const SUPPORTED_LOCALES_DISCORD_MAP_INVERSE = Object.fromEntries(
  Object.entries(SUPPORTED_LOCALES_DISCORD_MAP).map(([k, v]) => [v, k])
) as Record<Locale, string>;

export const SUPPORTED_LOCALES_DISCORD = Object.values(
  SUPPORTED_LOCALES_DISCORD_MAP
);

export const DEFAULT_LOCALE_DISCORD =
  SUPPORTED_LOCALES_DISCORD_MAP[locales.default];
