import { runMobileFromTemplate, type MobileInstallableDevice } from "../../mobile-install/index.js";
import { classifyMobileRetryGuide } from "../../mobile-install/errors/retry-errors.js";
import {
  createMobileRetryState,
  mergeLaunchResultWithMobileSteps
} from "../state/setup-launch-mobile-state.js";
import type { LaunchResultState } from "../types.js";
import type {
  SetupLaunchFlowInput,
  SetupLaunchFlowResult
} from "./types.js";

export async function runSingleDeviceMobileInstall(
  input: SetupLaunchFlowInput,
  launchResult: LaunchResultState,
  devices: MobileInstallableDevice[]
): Promise<SetupLaunchFlowResult> {
  const mobileResult = await runMobileFromTemplate({
    apiBaseUrl: launchResult.apiUrl,
    interactive: false,
    noResident: true,
    locale: input.locale,
    workspaceDir: launchResult.workspaceDir,
    selectedDevices: devices,
    skipReadinessCheck: true,
    ...(input.launchOptions.templateUrl ? { templateUrl: input.launchOptions.templateUrl } : {})
  }, {
    onStep: input.actions.appendMobileProgress,
    onFlutterProgress: input.actions.appendMobileFlutterProgress,
    onCommandOutput: input.actions.appendOutput,
    onDeviceComplete: input.actions.completeDeviceInstall
  });

  const nextLaunchResult = mergeLaunchResultWithMobileSteps({
    launchResult: {
      apiUrl: launchResult.apiUrl,
      webUrl: launchResult.webUrl,
      runtimeRoot: launchResult.runtimeRoot,
      workspaceDir: launchResult.workspaceDir
    },
    mobileResult
  });

  if (!mobileResult.ok) {
    const retryGuideKind = classifyMobileRetryGuide(
      input.locale,
      mobileResult.steps.map((step) => step.detail)
    );

    return {
      kind: "retry",
      launchResult: nextLaunchResult,
      retryState: createMobileRetryState({
        apiUrl: launchResult.apiUrl,
        webUrl: launchResult.webUrl,
        runtimeRoot: launchResult.runtimeRoot,
        workspaceDir: launchResult.workspaceDir,
        locale: input.locale,
        preferredDeviceIds: devices.map((device) => device.id),
        ...(retryGuideKind ? { retryGuideKind } : {}),
        rawSteps: mobileResult.steps
      })
    };
  }

  return {
    kind: "done",
    launchResult: nextLaunchResult
  };
}
