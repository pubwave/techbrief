import {
  localizedFreshnessChoices,
  localizedLanguageChoices,
  localizedLocalModelChoices,
  localizedModelSourceChoices
} from "./choices.js";
import { defaultWizardLanguage, detectWizardLocale } from "./detect-locale.js";
import { WIZARD_LOCALE_CATALOGS } from "./locales/index.js";
import type { MessageKey, WizardLocale } from "./types.js";

export { defaultWizardLanguage, detectWizardLocale };
export {
  localizedFreshnessChoices,
  localizedLanguageChoices,
  localizedLocalModelChoices,
  localizedModelSourceChoices
};
export type { WizardLocale };

export function wizardMessage(locale: WizardLocale, key: MessageKey): string {
  return WIZARD_LOCALE_CATALOGS[locale]?.messages[key] ?? WIZARD_LOCALE_CATALOGS.en.messages[key];
}

export function formatWizardMessage(
  locale: WizardLocale,
  key: MessageKey,
  replacements: Record<string, string>
): string {
  return Object.entries(replacements).reduce(
    (message, [name, value]) => message.replaceAll(`{{${name}}}`, value),
    wizardMessage(locale, key)
  );
}

export function wizardDescription(locale: WizardLocale, key: string): string {
  return WIZARD_LOCALE_CATALOGS[locale]?.descriptions[key] ?? WIZARD_LOCALE_CATALOGS.en.descriptions[key] ?? "";
}
