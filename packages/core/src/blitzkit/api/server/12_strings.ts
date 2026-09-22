import { Strings } from "@blitzkit/i18n";
import locales from "@blitzkit/i18n/locales.json";
import { DeepPartial } from "@blitzkit/protos";
import { merge } from "lodash-es";
import { Cache } from "./0_base";
import { ServerBlitzKitAPI11 } from "./11_scripts";

const globbedStrings = import.meta.glob("../../../../../i18n/strings/*.json", {
  import: "default",
});

export abstract class ServerBlitzKitAPI12 extends ServerBlitzKitAPI11 {
  @Cache()
  async strings(locale: string) {
    const localized = (await globbedStrings[
      `../../../../../i18n/strings/${locale}.json`
    ]()) as DeepPartial<Strings>;
    const defaults = (await globbedStrings[
      `../../../../../i18n/strings/${locales.default}.json`
    ]()) as Strings;
    const strings = merge({}, defaults, localized);

    return strings;
  }
}
