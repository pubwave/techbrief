import { BrowserRouter } from "react-router";
import { App } from "../App";
import { AppLoadingShell } from "../components/AppLoadingShell";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { useLocale } from "../hooks/useLocale";
import { useTheme } from "../hooks/useTheme";
import { AppRuntimeProvider } from "./AppRuntimeContext";

export function AppBootstrap() {
  const { isReady, locale, strings } = useLocale();
  const { theme, setTheme } = useTheme();
  const isDesktop = useIsDesktop();

  if (!isReady) {
    return <AppLoadingShell />;
  }

  return (
    <AppRuntimeProvider
      value={{
        isDesktop,
        locale,
        setTheme,
        strings,
        theme
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppRuntimeProvider>
  );
}
