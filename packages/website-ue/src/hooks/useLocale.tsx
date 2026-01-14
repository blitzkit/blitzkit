import locales from "@blitzkit/i18n/locales.json";
import { createContext, useContext, type ReactNode } from "react";
import { api } from "../core/api/dynamic";
import { useAwait } from "./useAwait";

const LocaleContext = createContext<{
  locale: string;
} | null>(null);

interface LocaleProviderProps extends LocaleAcceptorProps {
  children: ReactNode;
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return (
    <LocaleContext.Provider value={{ locale: locale ?? locales.default }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }

  const strings = useAwait(
    () => api.strings(context.locale),
    `strings-${context.locale}`
  );

  return { locale: context.locale, strings };
}

export interface LocaleAcceptorProps {
  locale: string | undefined;
}
