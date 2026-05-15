import {
  availableLocalModelChoices,
  isLocalModelInstalled,
  uninstallLocalModel,
  type ModelChoice
} from "../local-model/index.js";
import type { WizardLocale } from "../../shared/i18n/wizard/index.js";

export function isInstalledLocalModelChoice(choice: ModelChoice | undefined): boolean {
  return Boolean(choice && isLocalModelInstalled(choice.value));
}

export function removeLocalModelSelection(model: string, locale: WizardLocale): { ok: boolean; detail: string; nextModel: string } {
  const result = uninstallLocalModel(model, locale);
  const nextModel = availableLocalModelChoices()[0]?.value ?? "qwen2.5:7b";

  return {
    ...result,
    nextModel
  };
}
