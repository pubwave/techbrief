import { useEffect, useState } from "react";
import { defaultThemeId, type ThemeId } from "../theme/themes";

const storageKey = "techbrief.web.theme";

function readStoredTheme(): ThemeId {
  if (typeof window === "undefined") {
    return defaultThemeId;
  }

  const storedTheme = window.localStorage.getItem(storageKey);
  if (storedTheme === "current-theme" || storedTheme === "editorial-dawn" || storedTheme === "aurora-glass") {
    return storedTheme;
  }

  return defaultThemeId;
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeId>(readStoredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(storageKey, theme);
  }, [theme]);

  return { theme, setTheme };
}
