import { merge } from "ts-deepmerge";
import locales from "../locales.json";
import en from "../strings/en.json";
import es from "../strings/es.json";
import fr from "../strings/fr.json";
import ja from "../strings/ja.json";
import pl from "../strings/pl.json";
import pt from "../strings/pt.json";
import ru from "../strings/ru.json";
import uk from "../strings/uk.json";
import zh from "../strings/zh.json";

export type BlitzKitStrings = typeof en;

const stringsRaw: Record<string, TranslationTree> = {
  en,
  es,
  fr,
  ja,
  pl,
  pt,
  ru,
  uk,
  zh,
};

export const STRINGS: Record<string, BlitzKitStrings> = {};

for (const locale in stringsRaw) {
  if (locale === locales.default) {
    STRINGS[locales.default] = stringsRaw[locales.default] as BlitzKitStrings;
    continue;
  }

  const localeStrings = stringsRaw[locale];
  STRINGS[locale] = merge(
    stringsRaw[locales.default],
    localeStrings,
  ) as BlitzKitStrings;
}

export const SUPPORTED_LOCALE_BLITZ_MAP: Record<string, string> = {
  en: "en",
  es: "es",
  fr: "fr",
  ja: "ja",
  pt: "pt",
  ru: "ru",
  uk: "uk",
  zh: "zh-Hans",
  pl: "pl",
};

export const SUPPORTED_LOCALE_FLAGS: Record<string, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  fr: "🇫🇷",
  ja: "🇯🇵",
  pt: "🇵🇹",
  ru: "🇷🇺",
  uk: "🇺🇦",
  zh: "🇨🇳",
  pl: "🇵🇱",
};

export type TranslationTree = { [key: string]: TranslationNode };

export type TranslationNode = string | TranslationTree;
