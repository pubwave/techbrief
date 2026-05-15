import type { CloudProviderCatalogEntry } from "./cloud-shared.js";

const models = [
  { label: "DeepSeek V3.2 Exp", value: "deepseek-v3.2-exp", description: "", descriptionKey: "cloud-preview-model" },
  { label: "DeepSeek V3.1", value: "deepseek-v3.1", description: "", descriptionKey: "cloud-latest-flagship" },
  { label: "DeepSeek Chat", value: "deepseek-chat", description: "", descriptionKey: "cloud-balanced-default" },
  { label: "DeepSeek R1", value: "deepseek-reasoner", description: "", descriptionKey: "cloud-reasoning-model" },
  { label: "DeepSeek R1 0528", value: "deepseek-r1-0528", description: "", descriptionKey: "cloud-reasoning-model" },
  { label: "DeepSeek V3", value: "deepseek-v3", description: "", descriptionKey: "cloud-legacy-stable" },
  { label: "DeepSeek V2.5", value: "deepseek-v2.5", description: "", descriptionKey: "cloud-legacy-stable" },
  { label: "DeepSeek Coder V2", value: "deepseek-coder-v2", description: "", descriptionKey: "cloud-coding-model" },
  { label: "DeepSeek Coder", value: "deepseek-coder", description: "", descriptionKey: "cloud-coding-model" },
  { label: "DeepSeek R1 Lite Preview", value: "deepseek-r1-lite-preview", description: "", descriptionKey: "cloud-preview-model" }
];

export const deepSeekCatalog: CloudProviderCatalogEntry = {
  label: "DeepSeek",
  value: "deepseek",
  description: "",
  descriptionKey: "deepseek",
  models
};
