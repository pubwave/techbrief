import { openBrowser } from "../../../shared/browser/browser.js";
import { wizardMessage, type WizardLocale } from "../../../shared/i18n/wizard/index.js";
import { runMobileFromTemplate } from "../../mobile-install/index.js";
import { yieldToUi } from "../core/helpers.js";
import type { LaunchInput, LaunchStep } from "../core/types.js";

export async function runPostLaunchStages(input: {
  locale: WizardLocale;
  launchInput: LaunchInput;
  apiUrl: string;
  webUrl: string;
  steps: LaunchStep[];
}): Promise<boolean> {
  let mobileInstallOk = true;

  if (!input.launchInput.noMobile && input.launchInput.mobilePlatform) {
    const mobileResult = await runMobileFromTemplate({
      platform: input.launchInput.mobilePlatform,
      apiBaseUrl: input.apiUrl,
      locale: input.locale,
      ...(input.launchInput.templateUrl ? { templateUrl: input.launchInput.templateUrl } : {})
    });
    mobileInstallOk = mobileResult.ok;
    input.steps.push(...mobileResult.steps);
  }

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

  return mobileInstallOk;
}
