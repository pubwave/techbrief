import type { Strings } from "../i18n/types";
import type { ThemeId, ThemeOption } from "../theme/themes";
import { ui } from "../lib/ui";

interface SettingsPaneProps {
  currentTheme: ThemeId;
  themes: ThemeOption[];
  onThemeChange: (theme: ThemeId) => void;
  strings: Strings;
}

export function SettingsPane({ currentTheme, themes, onThemeChange, strings }: SettingsPaneProps) {
  return (
    <section className="min-h-full w-full overflow-y-auto border border-tb-border bg-tb-surface-shell p-5">
      <div className={ui.eyebrow}>{strings.settings}</div>
      <h1 className="my-3 text-[clamp(30px,3vw,42px)] leading-[1.08] font-semibold text-tb-text-primary">
        {strings.workspaceSettings}
      </h1>
      <p className="m-0 leading-7 text-tb-text-secondary">
        {strings.workspaceSettingsDescription}
      </p>
      <div className="mt-[22px]">
        <div className={`${ui.card} p-4`}>
          <div className="mb-2 text-[15px] font-bold text-tb-text-primary">{strings.theme}</div>
          <p className="m-0 leading-7 text-tb-text-secondary">
            {strings.themeDescription}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 max-lg:grid-cols-1">
            {themes.map((theme) => {
              const isActive = theme.id === currentTheme;

              return (
                <button
                  className={
                    isActive
                      ? `${ui.cardSelected} cursor-pointer p-4 text-left`
                      : `${ui.card} cursor-pointer p-4 text-left`
                  }
                  key={theme.id}
                  onClick={() => onThemeChange(theme.id)}
                  type="button"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-[15px] font-bold text-tb-text-primary">{strings.themeLabel(theme.id)}</div>
                    <span
                      className={
                        isActive
                          ? `${ui.tag} ${ui.tagAccent}`
                          : `${ui.tag} ${ui.tagDefault}`
                        }
                    >
                      {isActive ? strings.active : strings.apply}
                    </span>
                  </div>
                  <div className="mb-3 flex gap-2">
                    {theme.preview.map((swatch) => (
                      <span
                        className="h-9 flex-1 rounded-xl border border-white/10"
                        key={swatch}
                        style={{ background: swatch }}
                      />
                    ))}
                  </div>
                  <p className="m-0 leading-7 text-tb-text-secondary">{strings.themeSummary(theme.id)}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
