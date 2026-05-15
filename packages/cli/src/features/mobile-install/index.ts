import type {
  MobileInstallableDevice,
  MobilePlatform,
  MobileProgressCallbacks,
  MobileProgressStage,
  MobileReadinessResult,
  MobileRunInput,
  MobileRunResult
} from "./types.js";
import type { WizardLocale } from "../../shared/i18n/wizard/index.js";
import { inspectMobileReadiness as inspectMobileReadinessFlow } from "./mobile-readiness.js";
import { runMobileFromTemplate as runMobileFromTemplateFlow } from "./mobile-run.js";

export type {
  DeviceRunResult,
  MobileCheckStep,
  MobileInstallableDevice,
  MobilePlatform,
  MobileProgressCallbacks,
  MobileProgressStage,
  MobileReadinessResult,
  MobileRunInput,
  MobileRunResult
} from "./types.js";

export async function inspectMobileReadiness(
  localeInput?: WizardLocale,
  callbacks?: MobileProgressCallbacks
): Promise<MobileReadinessResult> {
  return await inspectMobileReadinessFlow(localeInput, callbacks);
}

export async function runMobileFromTemplate(
  input: MobileRunInput,
  callbacks?: MobileProgressCallbacks
): Promise<MobileRunResult> {
  return await runMobileFromTemplateFlow(input, callbacks);
}
