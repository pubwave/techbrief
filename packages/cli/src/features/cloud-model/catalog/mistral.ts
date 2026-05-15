import type { CloudProviderCatalogEntry } from "./cloud-shared.js";

const models = [
  { label: "Mistral Medium 3.1", value: "mistral-medium-2508", description: "", descriptionKey: "cloud-latest-flagship" },
  { label: "Mistral Small 3.2", value: "mistral-small-2506", description: "", descriptionKey: "cloud-balanced-default" },
  { label: "Magistral Medium", value: "magistral-medium-2507", description: "", descriptionKey: "cloud-reasoning-model" },
  { label: "Magistral Small", value: "magistral-small-2507", description: "", descriptionKey: "cloud-reasoning-model" },
  { label: "Codestral 25.08", value: "codestral-2508", description: "", descriptionKey: "cloud-coding-model" },
  { label: "Devstral Medium", value: "devstral-medium-2507", description: "", descriptionKey: "cloud-coding-model" },
  { label: "Mistral Saba", value: "mistral-saba-2502", description: "", descriptionKey: "cloud-specialized-model" },
  { label: "Pixtral Large", value: "pixtral-large-2411", description: "", descriptionKey: "cloud-multimodal-model" },
  { label: "Pixtral 12B", value: "pixtral-12b-2409", description: "", descriptionKey: "cloud-multimodal-model" },
  { label: "Ministral 8B", value: "ministral-8b-2410", description: "", descriptionKey: "cloud-fast-stable" }
];

export const mistralCatalog: CloudProviderCatalogEntry = {
  label: "Mistral",
  value: "mistral",
  description: "",
  descriptionKey: "mistral",
  models
};
