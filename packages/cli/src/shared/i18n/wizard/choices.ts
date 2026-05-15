import { SUPPORTED_LANGUAGES } from "@techbrief/shared";
import { cloudModelChoices, cloudProviderChoices } from "../../../features/cloud-model/index.js";
import type { ModelChoice } from "../../models/index.js";
import { interpolateMobileDocLinks } from "./mobile-doc-links.js";
import { WIZARD_LOCALE_CATALOGS } from "./locales/index.js";
import type { FreshnessOptionKey, WizardLocale } from "./types.js";

function withLocalizedDescriptions(locale: WizardLocale, choices: ModelChoice[], fallbackKeyMap?: Record<string, string>): ModelChoice[] {
  const descriptions = WIZARD_LOCALE_CATALOGS[locale].descriptions;
  const fallbackDescriptions = WIZARD_LOCALE_CATALOGS.en.descriptions;

  return choices.map((choice) => ({
    ...choice,
    description: descriptions[choice.descriptionKey ?? fallbackKeyMap?.[choice.value] ?? choice.value]
      ?? fallbackDescriptions[choice.descriptionKey ?? fallbackKeyMap?.[choice.value] ?? choice.value]
      ?? choice.description
  }));
}

export function localizedLanguageChoices(locale: WizardLocale): ModelChoice[] {
  const descriptions = WIZARD_LOCALE_CATALOGS[locale].descriptions;

  return SUPPORTED_LANGUAGES.map((language) => ({
    label: language.label,
    value: language.code,
    description: descriptions[language.code] ?? ""
  }));
}

export function localizedModelSourceChoices(locale: WizardLocale): ModelChoice[] {
  const labels = WIZARD_LOCALE_CATALOGS[locale].labels.modelSource;

  return withLocalizedDescriptions(locale, [
    { label: labels.cloud, value: "cloud", description: "" },
    { label: labels.local, value: "local", description: "" }
  ]);
}

export function localizedFreshnessChoices(locale: WizardLocale): ModelChoice[] {
  const labels = WIZARD_LOCALE_CATALOGS[locale].labels.freshness;
  const keys: FreshnessOptionKey[] = ["1", "3", "5", "7"];

  return withLocalizedDescriptions(
    locale,
    keys.map((key) => ({
      label: labels[key],
      value: key,
      description: ""
    }))
  );
}

export function localizedMobileInstallChoices(locale: WizardLocale): ModelChoice[] {
  const messages = WIZARD_LOCALE_CATALOGS[locale].messages;

  return withLocalizedDescriptions(locale, [
    { label: messages.mobileInstallSkip, value: "skip", description: "" },
    { label: messages.mobileInstallNow, value: "install", description: "" }
  ]).map((choice) => (
    choice.value === "install"
      ? {
          ...choice,
          description: interpolateMobileDocLinks(choice.description, locale)
        }
      : choice
  ));
}

export function localizedMobilePlatformChoices(locale: WizardLocale): ModelChoice[] {
  const messages = WIZARD_LOCALE_CATALOGS[locale].messages;

  return withLocalizedDescriptions(locale, [
    { label: messages.mobilePlatformAndroid, value: "android", description: "" },
    { label: messages.mobilePlatformIos, value: "ios", description: "" }
  ]);
}

export function localizedCloudProviderChoices(locale: WizardLocale): ModelChoice[] {
  return withLocalizedDescriptions(locale, cloudProviderChoices(), { local: "local-provider" });
}

export function localizedCloudModelChoices(locale: WizardLocale, provider: string): ModelChoice[] {
  return withLocalizedDescriptions(locale, cloudModelChoices(provider));
}

export function localizedLocalModelChoices(locale: WizardLocale, inputChoices?: ModelChoice[]): ModelChoice[] {
  const choices = inputChoices ?? [];
  const localizedChoices = withLocalizedDescriptions(locale, choices);
  const installedDescription = WIZARD_LOCALE_CATALOGS[locale].descriptions["installed-local-model"]
    ?? WIZARD_LOCALE_CATALOGS.en.descriptions["installed-local-model"];
  const remoteDescription = WIZARD_LOCALE_CATALOGS[locale].descriptions["popular-remote-model"]
    ?? WIZARD_LOCALE_CATALOGS.en.descriptions["popular-remote-model"];

  return localizedChoices.map((choice, index) => {
    const sourceChoice = choices[index];
    if (!sourceChoice?.label.endsWith("(Installed)")) {
      if (sourceChoice?.descriptionKey === "popular-remote-model") {
        return {
          ...choice,
          description: remoteDescription ?? choice.description
        };
      }

      return choice;
    }

    return {
      ...choice,
      description: WIZARD_LOCALE_CATALOGS[locale].descriptions[choice.value]
        ?? WIZARD_LOCALE_CATALOGS.en.descriptions[choice.value]
        ?? installedDescription
        ?? choice.description
    };
  });
}
