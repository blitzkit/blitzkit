import locales from "@blitzkit/i18n/locales.json";
import { LinkWrapper, type LinkWrapperProps } from "../LinkWrapper";
import styles from "./index.module.css";

export interface LinkI18nWrapperProps extends LinkWrapperProps {
  locale: string;
}

export function LinkI18nWrapper({
  locale,
  href,
  ...props
}: LinkI18nWrapperProps) {
  return (
    <LinkWrapper
      className={styles.wrapper}
      href={`${locale === locales.default ? "" : `/${locale}`}${href}`}
      {...props}
    />
  );
}
