import { useAppRuntime } from "../app/app-runtime";
import { SettingsPane } from "../components/SettingsPane";
import { themeOptions } from "../theme/themes";

export function SettingsPageRoute() {
  const { setTheme, strings, theme } = useAppRuntime();

  return (
    <SettingsPane
      currentTheme={theme}
      onThemeChange={setTheme}
      strings={strings}
      themes={themeOptions}
    />
  );
}
