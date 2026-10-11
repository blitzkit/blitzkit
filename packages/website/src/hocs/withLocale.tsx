import type { ReactNode } from "react";
import { LocaleProvider } from "../hooks/useLocale";

interface WithLocaleProps {
  locale: string;
}

export function withLocale<Props extends object>(
  Component: (props: Props) => ReactNode,
) {
  return function ({ locale, ...props }: Props & WithLocaleProps) {
    return (
      <LocaleProvider locale={locale}>
        <Component {...(props as Props)} />
      </LocaleProvider>
    );
  };
}
