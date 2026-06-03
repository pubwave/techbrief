import { openBrowser } from "../../../shared/browser/browser.js";
import { wizardMessage, type WizardLocale } from "../../../shared/i18n/wizard/index.js";
import { yieldToUi } from "../core/helpers.js";
import type { LaunchInput, LaunchStep } from "../core/types.js";

export async function runPostLaunchStages(input: {
  locale: WizardLocale;
  launchInput: LaunchInput;
  apiUrl: string;
  webUrl: string;
  steps: LaunchStep[];
}): Promise<boolean> {
  if (!input.launchInput.noOpen) {
    input.launchInput.onProgress?.("open-browser");
    await yieldToUi();
    const opened = openBrowser(input.webUrl);
    input.steps.push({
      label: "browser",
      ok: opened.ok,
      detail: opened.ok
        ? `${wizardMessage(input.locale, "launchBrowserOpened")} ${input.webUrl}`
        : `${wizardMessage(input.locale, "launchBrowserOpenManual")} ${input.webUrl}`
    });
  }

  return true;
}
