import { appendMobileInstallErrorLog } from "../logging/install-log.js";
import { wizardMessage, type WizardLocale } from "../../../shared/i18n/wizard/index.js";
import type { MobileInstallableDevice } from "../types.js";

export function summarizeMobileBuildFailure(
  locale: WizardLocale,
  device: MobileInstallableDevice,
  errorText: string
): string {
  const normalizedError = errorText.toLowerCase();

  if (
    device.platform === "ios"
    && (
      normalizedError.includes("developer mode disabled")
      || normalizedError.includes("enable developer mode in settings")
    )
  ) {
    return wizardMessage(locale, "mobileBuildIosDeveloperModeRequired");
  }

  if (
    device.platform === "ios"
    && (
      normalizedError.includes("no account for team")
      || normalizedError.includes("no profiles for")
      || normalizedError.includes("provisioning profile")
      || normalizedError.includes("problem signing")
    )
  ) {
    return wizardMessage(locale, "mobileBuildIosSigningFailed");
  }

  if (
    device.platform === "android"
    && (
      normalizedError.includes("install_failed_aborted")
      || normalizedError.includes("user rejected permissions")
      || normalizedError.includes("install canceled by user")
    )
  ) {
    return wizardMessage(locale, "mobileBuildAndroidInstallRejected");
  }

  return `${device.label}: ${errorText || wizardMessage(locale, "mobileBuildFailed")}`;
}

export async function logMobileInstallFailure(input: {
  activeWorkspaceDir: string;
  command?: string;
  device?: MobileInstallableDevice;
  errorText: string;
}): Promise<void> {
  try {
    await appendMobileInstallErrorLog({
      ...(input.command ? { command: input.command } : {}),
      ...(input.device ? { deviceLabel: input.device.label } : {}),
      ...(input.activeWorkspaceDir ? { workspaceDir: input.activeWorkspaceDir } : {}),
      errorText: input.errorText
    });
  } catch {
    // Logging must never hide the original install failure.
  }
}
