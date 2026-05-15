import {
  detectWizardLocale,
  formatWizardMessage,
  type WizardLocale
} from "../../shared/i18n/wizard/index.js";

export function resolveLocalModelLocale(locale?: WizardLocale): WizardLocale {
  return locale ?? detectWizardLocale();
}

export function localSupportReady(locale?: WizardLocale): string {
  return format(resolveLocalModelLocale(locale), "localSupportReady");
}

export function localSupportUnsupported(locale: WizardLocale, platform: string): string {
  return format(locale, "localSupportAutomaticSetupUnsupported", { platform });
}

export function localSupportAutomaticSetupFailed(locale: WizardLocale, detail?: string): string {
  return detail
    ? format(locale, "localSupportAutomaticSetupFailedWithDetail", { detail })
    : format(locale, "localSupportAutomaticSetupFailed");
}

export function localSupportInstalledNotReady(locale?: WizardLocale): string {
  return format(resolveLocalModelLocale(locale), "localSupportInstalledNotReady");
}

export function localSupportInstalledAutomatically(locale?: WizardLocale): string {
  return format(resolveLocalModelLocale(locale), "localSupportInstalledAutomatically");
}

export function localSupportReadyAt(locale: WizardLocale, origin: string): string {
  return format(locale, "localSupportReadyAt", { origin });
}

export function localModelAlreadyAvailable(locale: WizardLocale, model: string, supportReady: boolean): string {
  return format(locale, supportReady ? "localModelAlreadyAvailableWithSupport" : "localModelAlreadyAvailable", { model });
}

export function localModelReady(locale: WizardLocale, model: string, supportReady: boolean): string {
  return format(locale, supportReady ? "localModelReadyWithSupport" : "localModelReady", { model });
}

export function localModelPrepareFailed(locale: WizardLocale, model: string): string {
  return format(locale, "localModelPrepareFailed", { model });
}

export function localModelVerificationFailed(locale: WizardLocale, model: string, detail: string): string {
  return format(locale, "localModelVerificationFailed", { model, detail });
}

export function localModelNotInstalledPath(locale?: WizardLocale): string {
  return format(resolveLocalModelLocale(locale), "localModelNotInstalledPath");
}

export function localModelNotInstalledInOllama(locale: WizardLocale, model: string): string {
  return format(locale, "localModelNotInstalledInOllama", { model });
}

export function localModelRemoved(locale: WizardLocale, model: string): string {
  return format(locale, "localModelRemoved", { model });
}

export function localModelRemoveFailed(locale: WizardLocale, model: string): string {
  return format(locale, "localModelRemoveFailed", { model });
}

function format(locale: WizardLocale, key: Parameters<typeof formatWizardMessage>[1], replacements: Record<string, string> = {}): string {
  return formatWizardMessage(locale, key, replacements);
}
