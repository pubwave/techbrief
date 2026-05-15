import { wizardMessage, type WizardLocale } from "../../../shared/i18n/wizard/index.js";
import type { LaunchStep, MobileRetryState } from "../../setup/types.js";

export interface RetryStepInput {
  label: string;
  ok: boolean;
  detail: string;
}

export function normalizeMobileRetrySteps(locale: WizardLocale, steps: RetryStepInput[]): LaunchStep[] {
  return steps.map((step) => ({
    label: `mobile:${step.label}`,
    ok: step.ok,
    detail: normalizeMobileRetryDetail(locale, step.detail)
  }));
}

export function classifyMobileRetryGuide(
  locale: WizardLocale,
  details: string[]
): MobileRetryState["retryGuideKind"] | undefined {
  if (details.includes(wizardMessage(locale, "mobileBuildIosSigningFailed"))) {
    return "ios-signing";
  }

  if (details.includes(wizardMessage(locale, "mobileCheckXcodeMissing"))) {
    return "ios-xcode-missing";
  }

  if (details.includes(wizardMessage(locale, "mobileCheckCocoapodsMissing"))) {
    return "ios-cocoapods-missing";
  }

  if (details.includes(wizardMessage(locale, "mobileCheckAndroidToolsMissing"))) {
    return "android-tools-missing";
  }

  return undefined;
}

function normalizeMobileRetryDetail(locale: WizardLocale, detail: string): string {
  const normalizedDetail = detail.toLowerCase();

  if (
    normalizedDetail.includes("developer mode disabled")
    || normalizedDetail.includes("enable developer mode in settings")
  ) {
    return wizardMessage(locale, "mobileBuildIosDeveloperModeRequired");
  }

  return detail;
}
