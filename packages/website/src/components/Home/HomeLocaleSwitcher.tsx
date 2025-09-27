import locales from "@blitzkit/i18n/locales.json";
import { GlobeIcon } from "@radix-ui/react-icons";
import { Flex, Text } from "@radix-ui/themes";
import type { LocaleAcceptorProps } from "../../hooks/useLocale";
import { BlitzKitTheme } from "../BlitzKitTheme";
import { LocaleSwitcher } from "../LocaleSwitcher";

export function HomeLocaleSwitcher({
  locale = locales.default,
}: LocaleAcceptorProps) {
  return (
    <BlitzKitTheme>
      <Flex
        flexGrow="2"
        flexShrink="0"
        justify="center"
        mt="4"
        align="center"
        gap="3"
      >
        <Text size="5" trim="end" color="gray">
          <GlobeIcon width="1em" height="1em" />
        </Text>

        <LocaleSwitcher locale={locale} />
      </Flex>
    </BlitzKitTheme>
  );
}
