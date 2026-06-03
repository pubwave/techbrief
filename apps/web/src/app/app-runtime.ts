import { createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Locale, Strings } from "../i18n/types";
import type { ThemeId } from "../theme/themes";

export interface AppRuntimeValue {
  isDesktop: boolean;
  locale: Locale;
  setTheme: Dispatch<SetStateAction<ThemeId>>;
  strings: Strings;
  theme: ThemeId;
}

export const AppRuntimeContext = createContext<AppRuntimeValue | null>(null);

export function useAppRuntime() {
  const value = useContext(AppRuntimeContext);
  if (!value) {
    throw new Error("useAppRuntime must be used within AppRuntimeProvider.");
  }

  return value;
}
