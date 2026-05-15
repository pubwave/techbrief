import { access } from "node:fs/promises";
import path from "node:path";
import { logMobileInstallFailure, summarizeMobileBuildFailure } from "../errors/install-failure.js";
import type {
  DeviceRunResult,
  MobileCheckStep,
  MobileInstallableDevice,
  MobileProgressCallbacks,
  MobileRunInput
} from "../types.js";
import { buildFlutterRunArgs } from "../discovery/device-discovery.js";
import { stageTemplateArchive, type StagedTemplate } from "../../../shared/runtime/template.js";
import { wizardMessage, type WizardLocale } from "../../../shared/i18n/wizard/index.js";
import { formatCommand, runCommand, runCommandAsync, runInteractiveCommand } from "../../../shared/paths/workspace.js";

interface PreparedMobileWorkspace {
  activeWorkspaceDir: string;
  activeMobileDir: string;
  templateReference: string;
  staged: StagedTemplate | null;
}

export async function prepareMobileWorkspace(input: {
  callbacks?: MobileProgressCallbacks;
  locale: WizardLocale;
  runInput: MobileRunInput;
}): Promise<PreparedMobileWorkspace> {
  await input.callbacks?.onStep?.("template");

  if (input.runInput.workspaceDir) {
    const activeMobileDir = path.join(input.runInput.workspaceDir, "apps/mobile");
    await ensureMobileProjectExists(activeMobileDir);

    return {
      activeWorkspaceDir: input.runInput.workspaceDir,
      activeMobileDir,
      templateReference: input.runInput.workspaceDir,
      staged: null
    };
  }

  const staged = await stageTemplateArchive(input.runInput.templateUrl);
  await ensureMobileProjectExists(staged.mobileDir);

  return {
    activeWorkspaceDir: staged.workspaceDir,
    activeMobileDir: staged.mobileDir,
    templateReference: staged.templateUrl,
    staged
  };
}

export async function installMobileDependencies(input: {
  activeMobileDir: string;
  activeWorkspaceDir: string;
  callbacks?: MobileProgressCallbacks;
  flutterCommand: string;
  locale: WizardLocale;
}): Promise<MobileCheckStep> {
  await input.callbacks?.onStep?.("dependencies");
  const pubGetArgs = ["pub", "get"];
  const pubGet = runCommand(input.flutterCommand, pubGetArgs, input.activeMobileDir);
  const dependencyStep: MobileCheckStep = {
    label: formatCommand(input.flutterCommand, pubGetArgs),
    ok: pubGet.ok,
    detail: pubGet.ok
      ? wizardMessage(input.locale, "mobileDependenciesInstalled")
      : (pubGet.stderr || wizardMessage(input.locale, "mobileDependenciesFailed"))
  };

  if (!pubGet.ok) {
    await logMobileInstallFailure({
      activeWorkspaceDir: input.activeWorkspaceDir,
      command: formatCommand(input.flutterCommand, pubGetArgs),
      errorText: pubGet.stderr || wizardMessage(input.locale, "mobileDependenciesFailed")
    });
  }

  return dependencyStep;
}

export async function installMobileOnDevices(input: {
  activeMobileDir: string;
  activeWorkspaceDir: string;
  apiBaseUrl?: string;
  callbacks?: MobileProgressCallbacks;
  devices: MobileInstallableDevice[];
  flutterCommand: string;
  interactive?: boolean;
  locale: WizardLocale;
  noResident?: boolean;
}): Promise<DeviceRunResult[]> {
  return await Promise.all(input.devices.map((device) =>
    installOnDevice({
      activeMobileDir: input.activeMobileDir,
      activeWorkspaceDir: input.activeWorkspaceDir,
      command: input.flutterCommand,
      device,
      locale: input.locale,
      ...(input.apiBaseUrl ? { apiBaseUrl: input.apiBaseUrl } : {}),
      ...(input.callbacks ? { callbacks: input.callbacks } : {}),
      ...(input.interactive !== undefined ? { interactive: input.interactive } : {}),
      ...(input.noResident !== undefined ? { noResident: input.noResident } : {})
    })
  ));
}

async function ensureMobileProjectExists(mobileDir: string): Promise<void> {
  await access(path.join(mobileDir, "pubspec.yaml"));
}

async function installOnDevice(input: {
  activeMobileDir: string;
  activeWorkspaceDir: string;
  apiBaseUrl?: string;
  callbacks?: MobileProgressCallbacks;
  command: string;
  device: MobileInstallableDevice;
  interactive?: boolean;
  locale: WizardLocale;
  noResident?: boolean;
}): Promise<DeviceRunResult> {
  const runArgs = buildFlutterRunArgs(
    input.device.id,
    input.apiBaseUrl,
    input.noResident === true ? { noResident: true } : undefined
  );

  await input.callbacks?.onStep?.("install-device", input.device);

  const runResult = input.interactive === false
    ? await runCommandAsync(input.command, runArgs, input.activeMobileDir, {
        onStdout: (chunk) => input.callbacks?.onCommandOutput?.(chunk, "stdout", input.device),
        onStderr: (chunk) => input.callbacks?.onCommandOutput?.(chunk, "stderr", input.device)
      })
    : runInteractiveCommand(input.command, runArgs, input.activeMobileDir);
  const failureDetail = runResult.stderr || runResult.stdout || wizardMessage(input.locale, "mobileBuildFailed");

  if (!runResult.ok) {
    await logMobileInstallFailure({
      activeWorkspaceDir: input.activeWorkspaceDir,
      command: formatCommand(input.command, runArgs),
      device: input.device,
      errorText: failureDetail
    });
  }

  const result: DeviceRunResult = {
    device: input.device,
    ok: runResult.ok,
    detail: runResult.ok
      ? `${input.device.label}: ${wizardMessage(input.locale, "mobileBuildInstalled")}`
      : summarizeMobileBuildFailure(input.locale, input.device, failureDetail),
    label: formatCommand(input.command, runArgs)
  };

  await input.callbacks?.onDeviceComplete?.(result);

  return result;
}
