import { detectWizardLocale, wizardMessage, type WizardLocale } from "../../shared/i18n/wizard/index.js";
import { inspectMobileReadinessWithFlutterCommand } from "./discovery/device-discovery.js";
import { logMobileInstallFailure } from "./errors/install-failure.js";
import {
  installMobileDependencies,
  installMobileOnDevices
} from "./workflow/mobile-run-workflow.js";
import { ensureFlutterToolWithProgress } from "./workflow/flutter-sdk.js";
import type {
  MobileCheckStep,
  MobileInstallableDevice,
  MobileProgressCallbacks,
  MobileRunInput,
  MobileRunResult
} from "./types.js";
import {
  createMobileRunState,
  finalizeMobileRun,
  prepareMobileWorkspaceState
} from "./mobile-run-state.js";

export async function runMobileFromTemplate(
  input: MobileRunInput,
  callbacks?: MobileProgressCallbacks
): Promise<MobileRunResult> {
  const locale = input.locale ?? detectWizardLocale();
  const state = createMobileRunState(input);

  try {
    const flutterStep = await resolveFlutterStep(locale, callbacks);
    state.steps.push(flutterStep.step);
    if (!flutterStep.step.ok) {
      return await finalizeMobileRun(input, state, false);
    }

    const targetDevices = await resolveTargetDevices({
      input,
      locale,
      flutterCommand: flutterStep.command,
      steps: state.steps,
      ...(callbacks ? { callbacks } : {})
    });

    if (targetDevices.length === 0) {
      state.steps.push({
        label: "device-selection",
        ok: false,
        detail: wizardMessage(locale, "mobileCheckDeviceConnectionMissing")
      });
      return await finalizeMobileRun(input, state, false);
    }

    state.selectedDevice = targetDevices[0];
    await prepareMobileWorkspaceState(input, callbacks, locale, state);

    const dependencyStep = await installMobileDependencies({
      activeMobileDir: state.activeMobileDir,
      activeWorkspaceDir: state.activeWorkspaceDir,
      flutterCommand: flutterStep.command,
      locale,
      ...(callbacks ? { callbacks } : {})
    });
    state.steps.push(dependencyStep);
    if (!dependencyStep.ok) {
      return await finalizeMobileRun(input, state, false);
    }

    const deviceResults = await installMobileOnDevices({
      activeMobileDir: state.activeMobileDir,
      activeWorkspaceDir: state.activeWorkspaceDir,
      flutterCommand: flutterStep.command,
      locale,
      devices: targetDevices,
      ...(input.apiBaseUrl ? { apiBaseUrl: input.apiBaseUrl } : {}),
      ...(callbacks ? { callbacks } : {}),
      ...(input.interactive !== undefined ? { interactive: input.interactive } : {}),
      ...(input.noResident !== undefined ? { noResident: input.noResident } : {})
    });

    for (const deviceResult of deviceResults) {
      state.steps.push({
        label: deviceResult.label,
        ok: deviceResult.ok,
        detail: deviceResult.detail
      });
    }

    return await finalizeMobileRun(input, state, deviceResults.every((deviceResult) => deviceResult.ok));
  } catch (error) {
    await logMobileInstallFailure({
      activeWorkspaceDir: state.activeWorkspaceDir,
      errorText: error instanceof Error ? error.message : wizardMessage(locale, "mobileUnknownError")
    });
    state.steps.push({
      label: "mobile-run",
      ok: false,
      detail: error instanceof Error ? error.message : wizardMessage(locale, "mobileUnknownError")
    });
    return await finalizeMobileRun(input, state, false);
  }
}

async function resolveFlutterStep(
  locale: WizardLocale,
  callbacks?: MobileProgressCallbacks
): Promise<{ command: string; step: MobileCheckStep }> {
  await callbacks?.onStep?.("flutter");
  const flutterTool = await ensureFlutterToolWithProgress(locale, callbacks?.onFlutterProgress);
  return {
    command: flutterTool.command,
    step: {
      label: "flutter",
      ok: flutterTool.ok,
      detail: flutterTool.ok ? flutterTool.detail : (flutterTool.detail || wizardMessage(locale, "mobileCheckFlutterMissing"))
    }
  };
}

async function resolveTargetDevices(input: {
  input: MobileRunInput;
  locale: WizardLocale;
  flutterCommand: string;
  callbacks?: MobileProgressCallbacks;
  steps: MobileRunResult["steps"];
}): Promise<MobileInstallableDevice[]> {
  let readinessDevices = input.input.selectedDevices ?? [];

  if (input.input.skipReadinessCheck !== true) {
    const readiness = await inspectMobileReadinessWithFlutterCommand(
      input.locale,
      input.flutterCommand,
      input.callbacks
    );
    input.steps.push(...readiness.steps);

    if (!readiness.ok) {
      return [];
    }

    readinessDevices = readiness.devices;
  }

  return input.input.selectedDevices && input.input.selectedDevices.length > 0
    ? input.input.selectedDevices
    : readinessDevices.filter((device) => !input.input.platform || device.platform === input.input.platform);
}
