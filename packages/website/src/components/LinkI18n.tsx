import locales from "@blitzkit/i18n/locales.json";
import { Link, type LinkProps } from "@radix-ui/themes";
import type { LocaleAcceptorProps } from "../hooks/useLocale";

type LinkI18nProps = LinkProps & LocaleAcceptorProps;

export function LinkI18n({ locale, href, ...props }: LinkI18nProps) {
  const prefix =
    locale === undefined || locale === locales.default ? "" : `/${locale}`;

  return (
    <Link href={href?.startsWith("/") ? `${prefix}${href}` : href} {...props} />
  );
}
