export type ThemeId = "current-theme" | "editorial-dawn" | "aurora-glass";

export interface ThemeOption {
  id: ThemeId;
  preview: [string, string, string];
}

export const defaultThemeId: ThemeId = "current-theme";

export const themeOptions: ThemeOption[] = [
  {
    id: "current-theme",
    preview: ["#081522", "#0d1c2c", "#35d6ff"]
  },
  {
    id: "editorial-dawn",
    preview: ["#f3eee4", "#fff9ef", "#2a7fff"]
  },
  {
    id: "aurora-glass",
    preview: ["#123740", "#183947", "#74f7d5"]
  }
];
