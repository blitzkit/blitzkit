import locales from "@blitzkit/i18n/locales.json";
import { Link, type LinkProps } from "./Link";

export interface LinkI18n extends LinkProps {
  locale: string;
}

export function LinkI18n({ locale, href, ...props }: LinkI18n) {
  return (
    <Link
      href={`${locale === locales.default ? "" : `/${locale}`}${href}`}
      {...props}
    />
  );
}
