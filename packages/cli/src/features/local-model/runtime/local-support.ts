import { extractCommandFailureDetail } from "../../../shared/process/command-output.js";
import { probeCommand, runCommand, runCommandAsync, runInteractiveCommand } from "../../../shared/paths/workspace.js";
import { ensureSessionPathInitialized, refreshSessionPath } from "../../../shared/paths/session-path.js";
import { detectWizardLocale, type WizardLocale } from "../../../shared/i18n/wizard/index.js";
import { suspendTerminalScreen } from "../../../shared/terminal/terminal-screen.js";
import {
  localSupportAutomaticSetupFailed,
  localSupportInstalledAutomatically,
  localSupportInstalledNotReady,
  localSupportReady,
  localSupportUnsupported
} from "../local-model-messages.js";
import { ensureLocalRuntimeStarted } from "./local-runtime.js";

export interface LocalSupportEnsureResult {
  ok: boolean;
  detail: string;
  attemptedInstall: boolean;
}

export type LocalSupportEnsureProgressStage = "check" | "install";
export interface LocalSupportOutputHandlers {
  interactiveNotice?: string;
  locale?: WizardLocale;
}

export function isLocalSupportAvailable(): boolean {
  ensureSessionPathInitialized();

  if (process.platform === "win32") {
    return probeCommand("where", ["ollama"]).ok;
  }

  return probeCommand("sh", ["-lc", "command -v ollama"]).ok;
}

export function ensureLocalSupportInstalled(onProgress?: (stage: LocalSupportEnsureProgressStage) => void): LocalSupportEnsureResult {
  const locale = detectWizardLocale();
  onProgress?.("check");
  if (isLocalSupportAvailable()) {
    return {
      ok: true,
      detail: localSupportReady(locale),
      attemptedInstall: false
    };
  }

  const installCommand = installCommandForPlatform();
  if (!installCommand) {
    return {
      ok: false,
      detail: localSupportUnsupported(locale, process.platform),
      attemptedInstall: false
    };
  }

  onProgress?.("install");
  const installResult = shouldUseInteractiveInstall()
    ? suspendTerminalScreen(() => runInteractiveInstall(installCommand))
    : runCommand(installCommand.command, installCommand.args);
  if (!installResult.ok) {
    const detail = extractCommandFailureDetail(installResult.stderr, installResult.stdout);

    return {
      ok: false,
      detail: localSupportAutomaticSetupFailed(locale, detail ?? undefined),
      attemptedInstall: true
    };
  }

  refreshSessionPath();
  if (!isLocalSupportAvailable()) {
    return {
      ok: false,
      detail: localSupportInstalledNotReady(locale),
      attemptedInstall: true
    };
  }

  return {
    ok: true,
    detail: localSupportInstalledAutomatically(locale),
    attemptedInstall: true
  };
}

export async function ensureLocalSupportInstalledAsync(
  onProgress?: (stage: LocalSupportEnsureProgressStage) => void,
  handlers?: LocalSupportOutputHandlers
): Promise<LocalSupportEnsureResult> {
  const locale = handlers?.locale ?? detectWizardLocale();
  onProgress?.("check");
  if (isLocalSupportAvailable()) {
    return {
      ok: true,
      detail: localSupportReady(locale),
      attemptedInstall: false
    };
  }

  const installCommand = installCommandForPlatform();
  if (!installCommand) {
    return {
      ok: false,
      detail: localSupportUnsupported(locale, process.platform),
      attemptedInstall: false
    };
  }

  onProgress?.("install");
  const installResult = shouldUseInteractiveInstall()
    ? suspendTerminalScreen(() => runInteractiveInstall(installCommand, handlers?.interactiveNotice))
    : await runCommandAsync(installCommand.command, installCommand.args);
  if (!installResult.ok) {
    const detail = extractCommandFailureDetail(installResult.stderr, installResult.stdout);

    return {
      ok: false,
      detail: localSupportAutomaticSetupFailed(locale, detail ?? undefined),
      attemptedInstall: true
    };
  }

  refreshSessionPath();
  if (!isLocalSupportAvailable()) {
    return {
      ok: false,
      detail: localSupportInstalledNotReady(locale),
      attemptedInstall: true
    };
  }

  return {
    ok: true,
    detail: localSupportInstalledAutomatically(locale),
    attemptedInstall: true
  };
}

export async function ensureLocalSupportRuntimeReady(input?: { session?: boolean }): Promise<LocalSupportEnsureResult> {
  const runtimeResult = await ensureLocalRuntimeStarted(input);

  return {
    ok: runtimeResult.ok,
    detail: runtimeResult.detail,
    attemptedInstall: runtimeResult.attemptedStart
  };
}

function installCommandForPlatform(): { command: string; args: string[]; label: string } | null {
  switch (process.platform) {
    case "darwin":
    case "linux":
      return {
        command: "sh",
        args: ["-lc", "curl -fsSL --no-progress-meter https://ollama.com/install.sh | OLLAMA_NO_START=1 sh"],
        label: "curl -fsSL --no-progress-meter https://ollama.com/install.sh | OLLAMA_NO_START=1 sh"
      };
    case "win32":
      return {
        command: "powershell",
        args: ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", "irm https://ollama.com/install.ps1 | iex"],
        label: "irm https://ollama.com/install.ps1 | iex"
      };
    default:
      return null;
  }
}

function shouldUseInteractiveInstall(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

function runInteractiveInstall(
  installCommand: { command: string; args: string[]; label: string },
  interactiveNotice?: string
) {
  if (interactiveNotice) {
    process.stdout.write(`${interactiveNotice}\n`);
  }

  return runInteractiveCommand(installCommand.command, installCommand.args);
}
