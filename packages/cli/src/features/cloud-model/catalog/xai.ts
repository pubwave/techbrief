import type { CloudProviderCatalogEntry } from "./cloud-shared.js";

const models = [
  { label: "Grok 4", value: "grok-4", description: "", descriptionKey: "cloud-latest-flagship" },
  { label: "Grok 4 Latest", value: "grok-4-latest", description: "", descriptionKey: "cloud-balanced-default" },
  { label: "Grok 4 Fast", value: "grok-4-fast", description: "", descriptionKey: "cloud-fast-latest" },
  { label: "Grok 4 Fast Reasoning", value: "grok-4-fast-reasoning", description: "", descriptionKey: "cloud-reasoning-model" },
  { label: "Grok 4 Fast Non-Reasoning", value: "grok-4-fast-non-reasoning", description: "", descriptionKey: "cloud-fast-latest" },
  { label: "Grok 4.20", value: "grok-4-20", description: "", descriptionKey: "cloud-preview-model" },
  { label: "Grok 3", value: "grok-3", description: "", descriptionKey: "cloud-legacy-stable" },
  { label: "Grok 3 Mini", value: "grok-3-mini", description: "", descriptionKey: "cloud-fast-stable" },
  { label: "Grok Code Fast 1", value: "grok-code-fast-1", description: "", descriptionKey: "cloud-coding-model" },
  { label: "Grok Vision Beta", value: "grok-vision-beta", description: "", descriptionKey: "cloud-multimodal-model" }
];

export const xAiCatalog: CloudProviderCatalogEntry = {
  label: "xAI",
  value: "xai",
  description: "",
  descriptionKey: "xai",
  models
};
