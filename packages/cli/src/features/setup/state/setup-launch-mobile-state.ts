import path from "node:path";
import type { MobileInstallableDevice, MobileRunResult } from "../../mobile-install/index.js";
import type { LaunchResultState, MobileDeviceChoiceState, MobileRetryState } from "../types.js";
import { normalizeMobileRetrySteps, type RetryStepInput } from "../../mobile-install/errors/retry-errors.js";
import type { WizardLocale } from "../../../shared/i18n/wizard/index.js";

interface RetryStateInput {
  apiUrl: string;
  webUrl: string;
  runtimeRoot: string;
  workspaceDir: string;
  locale: WizardLocale;
  retryGuideKind?: MobileRetryState["retryGuideKind"];
  preferredDeviceIds?: string[];
  rawSteps: RetryStepInput[];
}

export function createMobileRetryState(input: RetryStateInput): MobileRetryState {
  const signingHelpRequired = input.retryGuideKind === "ios-signing";

  return {
    apiUrl: input.apiUrl,
    webUrl: input.webUrl,
    runtimeRoot: input.runtimeRoot,
    workspaceDir: input.workspaceDir,
    ...(input.preferredDeviceIds ? { preferredDeviceIds: input.preferredDeviceIds } : {}),
    ...(input.retryGuideKind ? { retryGuideKind: input.retryGuideKind } : {}),
    ...(signingHelpRequired
      ? {
          requiresXcodeSigningHelp: true,
          xcodeOpened: false,
          xcodeWorkspacePath: path.join(input.workspaceDir, "apps/mobile/ios/Runner.xcworkspace")
        }
      : {}),
    steps: normalizeMobileRetrySteps(input.locale, input.rawSteps)
  };
}

export function createMobileDeviceChoiceState(input: {
  apiUrl: string;
  webUrl: string;
  runtimeRoot: string;
  workspaceDir: string;
  devices: MobileInstallableDevice[];
}): MobileDeviceChoiceState {
  return {
    apiUrl: input.apiUrl,
    webUrl: input.webUrl,
    runtimeRoot: input.runtimeRoot,
    workspaceDir: input.workspaceDir,
    devices: input.devices,
    selectedDeviceIds: input.devices.map((device) => device.id)
  };
}

export function mergeLaunchResultWithMobileSteps(input: {
  launchResult: Pick<LaunchResultState, "apiUrl" | "webUrl" | "runtimeRoot" | "workspaceDir"> & {
    steps?: LaunchResultState["steps"];
  };
  mobileResult: MobileRunResult;
}): LaunchResultState {
  const baseSteps = (input.launchResult.steps ?? []).filter((step) => !step.label.startsWith("mobile:"));
  const mobileSteps = input.mobileResult.steps.map((step) => ({
    label: `mobile:${step.label}`,
    ok: step.ok,
    detail: step.detail
  }));
  const steps = [...baseSteps, ...mobileSteps];

  return {
    ok: steps.every((step) => step.ok),
    apiUrl: input.launchResult.apiUrl,
    webUrl: input.launchResult.webUrl,
    runtimeRoot: input.launchResult.runtimeRoot,
    workspaceDir: input.launchResult.workspaceDir,
    steps
  };
}
