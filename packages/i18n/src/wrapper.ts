import locales from "../locales.json";
import { BlitzKitStrings, STRINGS } from "./strings";

export function wrapper(slicer: (strings: BlitzKitStrings) => string) {
  const defaultString = slicer(STRINGS[locales.default] as BlitzKitStrings);

  const object = { [locales.default]: defaultString };

  for (const { locale } of locales.supported) {
    const string = slicer(STRINGS[locale] as BlitzKitStrings);
    if (string !== defaultString) object[locale] = string;
  }

  return object;
}
