import { unwrapper } from "@blitzkit/i18n";
import locales from "@blitzkit/i18n/locales.json";
import { createContext, useContext, type ReactNode } from "react";
import { getStrings } from "../core/i18n/getStrings";

const LocaleContext = createContext<{
  locale: string;
  localeRaw: string | undefined;
} | null>(null);

interface LocaleProviderProps extends LocaleAcceptorProps {
  children: ReactNode;
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return (
    <LocaleContext.Provider
      value={{ locale: locale ?? locales.default, localeRaw: locale }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }

  const strings = getStrings(context.locale);
  const unwrap = unwrapper(context.locale);

  return { locale: context.locale, strings, unwrap };
}

export interface LocaleAcceptorProps {
  locale: string | undefined;
}
