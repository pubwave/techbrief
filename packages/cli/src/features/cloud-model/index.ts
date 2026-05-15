import type { ModelChoice } from "../../shared/models/index.js";
import { cloudModelCatalog, cloudProviderCatalog } from "./catalog/index.js";

export function cloudProviderChoices(): ModelChoice[] {
  return cloudProviderCatalog();
}

export function cloudModelChoices(provider: string): ModelChoice[] {
  return cloudModelCatalog(provider).map((choice) => ({
    ...choice,
    label: choice.value
  }));
}
