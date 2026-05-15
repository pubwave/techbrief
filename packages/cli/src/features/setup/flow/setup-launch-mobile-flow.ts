import {
  inspectMobileReadiness,
  runMobileFromTemplate,
  type MobileInstallableDevice
} from "../../mobile-install/index.js";
import { wizardMessage } from "../../../shared/i18n/wizard/index.js";
import {
  createMobileDeviceChoiceState,
  createMobileRetryState,
  mergeLaunchResultWithMobileSteps
} from "../state/setup-launch-mobile-state.js";
import { classifyMobileRetryGuide } from "../../mobile-install/errors/retry-errors.js";
import { resolveRetryDeviceSelection } from "../state/setup-mobile-retry-selection.js";
import type {
  LaunchResultState,
  MobileDeviceChoiceState,
  MobileRetryState
} from "../types.js";
import type { SetupLaunchFlowInput } from "./types.js";

interface ContinueMobileSetupInput extends Pick<SetupLaunchFlowInput, "actions" | "launchOptions" | "locale"> {
  phase: "mobileRetrySaving" | "mobileDeviceSaving";
  mobileDeviceChoiceState: MobileDeviceChoiceState | null;
  mobileRetryState: MobileRetryState | null;
}

export type ContinueMobileSetupResult =
  | { kind: "done"; launchResult: LaunchResultState }
  | { kind: "choice"; choiceState: MobileDeviceChoiceState }
  | { kind: "retry"; retryState: MobileRetryState }
  | { kind: "error"; error: string };

export async function continueMobileSetup(
  input: ContinueMobileSetupInput
): Promise<ContinueMobileSetupResult> {
  if (input.phase === "mobileDeviceSaving" && !input.mobileDeviceChoiceState) {
    return {
      kind: "error",
      error: wizardMessage(input.locale, "mobileUnknownError")
    };
  }

  if (input.phase === "mobileRetrySaving" && !input.mobileRetryState) {
    return {
      kind: "error",
      error: wizardMessage(input.locale, "mobileUnknownError")
    };
  }

  const activeMobileState = input.phase === "mobileDeviceSaving"
    ? input.mobileDeviceChoiceState!
    : input.mobileRetryState!;

  await input.actions.appendProgressAndYield(
    wizardMessage(input.locale, "progressPrepareMobile"),
    "cyan",
    wizardMessage(input.locale, "progressPreparedMobile")
  );

  let retrySelectedDevices: MobileInstallableDevice[] | null = null;

  if (input.phase === "mobileRetrySaving") {
    const readiness = await inspectMobileReadiness(input.locale, {
      onStep: input.actions.appendMobileProgress,
      onFlutterProgress: input.actions.appendMobileFlutterProgress
    });

    if (!readiness.ok) {
      const retryGuideKind = classifyMobileRetryGuide(
        input.locale,
        readiness.steps.map((step) => step.detail)
      );

      return {
        kind: "retry",
        retryState: createMobileRetryState({
          apiUrl: activeMobileState.apiUrl,
          webUrl: activeMobileState.webUrl,
          runtimeRoot: activeMobileState.runtimeRoot,
          workspaceDir: activeMobileState.workspaceDir,
          locale: input.locale,
          ...(retryGuideKind ? { retryGuideKind } : {}),
          rawSteps: readiness.steps
        })
      };
    }

    const retryDeviceSelection = resolveRetryDeviceSelection(
      readiness.devices,
      input.mobileRetryState!.preferredDeviceIds
    );

    if (retryDeviceSelection.status === "unavailable") {
      return {
        kind: "retry",
        retryState: {
          ...input.mobileRetryState!,
          steps: [{
            label: "mobile:device",
            ok: false,
            detail: wizardMessage(input.locale, "mobileRetrySelectedDeviceUnavailable")
          }]
        }
      };
    }

    if (retryDeviceSelection.status === "choice") {
      return {
        kind: "choice",
        choiceState: createMobileDeviceChoiceState({
          apiUrl: activeMobileState.apiUrl,
          webUrl: activeMobileState.webUrl,
          runtimeRoot: activeMobileState.runtimeRoot,
          workspaceDir: activeMobileState.workspaceDir,
          devices: retryDeviceSelection.devices
        })
      };
    }

    retrySelectedDevices = retryDeviceSelection.devices;
  }

  const mobileResult = await runSelectedMobileInstall({
    activeMobileState,
    launchOptions: input.launchOptions,
    locale: input.locale,
    selectedDevices: input.phase === "mobileDeviceSaving"
      ? input.mobileDeviceChoiceState!.devices.filter((device) =>
        input.mobileDeviceChoiceState!.selectedDeviceIds.includes(device.id)
      )
      : retrySelectedDevices,
    skipReadinessCheck: input.phase === "mobileRetrySaving",
    actions: input.actions
  });

  const nextLaunchResult = mergeLaunchResultWithMobileSteps({
    launchResult: activeMobileState,
    mobileResult
  });

  if (!mobileResult.ok) {
    const retryGuideKind = classifyMobileRetryGuide(
      input.locale,
      mobileResult.steps.map((step) => step.detail)
    );

    return {
      kind: "retry",
      retryState: createMobileRetryState({
        apiUrl: activeMobileState.apiUrl,
        webUrl: activeMobileState.webUrl,
        runtimeRoot: activeMobileState.runtimeRoot,
        workspaceDir: activeMobileState.workspaceDir,
        locale: input.locale,
        ...(input.phase === "mobileDeviceSaving"
          ? { preferredDeviceIds: input.mobileDeviceChoiceState!.selectedDeviceIds }
          : retrySelectedDevices
            ? { preferredDeviceIds: retrySelectedDevices.map((device) => device.id) }
            : {}),
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

async function runSelectedMobileInstall(input: {
  activeMobileState: Pick<
    MobileDeviceChoiceState,
    "apiUrl" | "workspaceDir"
  >;
  launchOptions: SetupLaunchFlowInput["launchOptions"];
  locale: SetupLaunchFlowInput["locale"];
  selectedDevices?: MobileInstallableDevice[] | null;
  skipReadinessCheck: boolean;
  actions: SetupLaunchFlowInput["actions"];
}) {
  return await runMobileFromTemplate({
    apiBaseUrl: input.activeMobileState.apiUrl,
    interactive: false,
    noResident: true,
    locale: input.locale,
    workspaceDir: input.activeMobileState.workspaceDir,
    ...(input.skipReadinessCheck ? { skipReadinessCheck: true } : {}),
    ...(input.selectedDevices ? { selectedDevices: input.selectedDevices } : {}),
    ...(input.launchOptions.templateUrl ? { templateUrl: input.launchOptions.templateUrl } : {})
  }, {
    onStep: input.actions.appendMobileProgress,
    onFlutterProgress: input.actions.appendMobileFlutterProgress,
    onCommandOutput: input.actions.appendOutput,
    onDeviceComplete: input.actions.completeDeviceInstall
  });
}
