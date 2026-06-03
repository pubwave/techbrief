import type { ReactNode } from "react";
import { AppRuntimeContext, type AppRuntimeValue } from "./app-runtime";

interface AppRuntimeProviderProps {
  children: ReactNode;
  value: AppRuntimeValue;
}

export function AppRuntimeProvider({ children, value }: AppRuntimeProviderProps) {
  return <AppRuntimeContext.Provider value={value}>{children}</AppRuntimeContext.Provider>;
}
