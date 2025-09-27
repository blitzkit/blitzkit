import {
  STRINGS,
  SUPPORTED_LOCALE_FLAGS,
  type BlitzKitStrings,
} from "@blitzkit/i18n";
import locales from "@blitzkit/i18n/locales.json";
import { Select } from "@radix-ui/themes";
import type { LocaleAcceptorProps } from "../hooks/useLocale";
import { BlitzKitTheme } from "./BlitzKitTheme";

export function LocaleSwitcherThemeWrapper({ locale }: LocaleAcceptorProps) {
  return (
    <BlitzKitTheme style={{ background: "transparent" }}>
      <LocaleSwitcher locale={locale} />
    </BlitzKitTheme>
  );
}

export function LocaleSwitcher({ locale }: LocaleAcceptorProps) {
  return (
    <Select.Root
      defaultValue={locale}
      onValueChange={(locale) => {
        localStorage.setItem("preferred-locale", locale);

        let rawPath = window.location.pathname;

        for (const supported of locales.supported) {
          if (window.location.pathname.startsWith(`/${supported.locale}`)) {
            rawPath = rawPath.replace(`/${supported.locale}`, "");
            break;
          }
        }

        window.location.pathname = `${
          locale === locales.default ? "" : `/${locale}`
        }${rawPath}`;
      }}
    >
      <Select.Trigger variant="classic" />

      <Select.Content>
        {locales.supported.map(({ locale }) => (
          <Select.Item key={locale} value={locale}>
            {SUPPORTED_LOCALE_FLAGS[locale]}{" "}
            {
              STRINGS[locale].common.locales[
                locale as keyof BlitzKitStrings["common"]["locales"]
              ]
            }
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}
