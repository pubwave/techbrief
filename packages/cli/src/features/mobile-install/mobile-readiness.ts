import { detectWizardLocale, wizardMessage, type WizardLocale } from "../../shared/i18n/wizard/index.js";
import { inspectMobileReadinessWithFlutterCommand } from "./discovery/device-discovery.js";
import { ensureFlutterToolWithProgress } from "./workflow/flutter-sdk.js";
import type {
  MobileCheckStep,
  MobileProgressCallbacks,
  MobileReadinessResult
} from "./types.js";

export async function inspectMobileReadiness(
  localeInput?: WizardLocale,
  callbacks?: MobileProgressCallbacks
): Promise<MobileReadinessResult> {
  const locale = localeInput ?? detectWizardLocale();
  await callbacks?.onStep?.("flutter");
  const flutterTool = await ensureFlutterToolWithProgress(locale, callbacks?.onFlutterProgress);
  const flutterStep: MobileCheckStep = {
    label: "flutter",
    ok: flutterTool.ok,
    detail: flutterTool.ok ? flutterTool.detail : (flutterTool.detail || wizardMessage(locale, "mobileCheckFlutterMissing"))
  };

  if (!flutterTool.ok) {
    return {
      ok: false,
      steps: [flutterStep],
      devices: []
    };
  }

  const readiness = await inspectMobileReadinessWithFlutterCommand(locale, flutterTool.command, callbacks);
  return {
    ok: readiness.ok && flutterStep.ok,
    steps: [flutterStep, ...readiness.steps],
    devices: readiness.devices
  };
}
