import { createContext, useContext } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { Locale, Strings } from "../i18n/types";
import type { ThemeId } from "../theme/themes";

interface AppRuntimeValue {
  isDesktop: boolean;
  locale: Locale;
  setTheme: Dispatch<SetStateAction<ThemeId>>;
  strings: Strings;
  theme: ThemeId;
}

const AppRuntimeContext = createContext<AppRuntimeValue | null>(null);

interface AppRuntimeProviderProps {
  children: ReactNode;
  value: AppRuntimeValue;
}

export function AppRuntimeProvider({ children, value }: AppRuntimeProviderProps) {
  return <AppRuntimeContext.Provider value={value}>{children}</AppRuntimeContext.Provider>;
}

export function useAppRuntime() {
  const value = useContext(AppRuntimeContext);
  if (!value) {
    throw new Error("useAppRuntime must be used within AppRuntimeProvider.");
  }

  return value;
}
