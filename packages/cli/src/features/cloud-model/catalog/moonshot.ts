import type { CloudProviderCatalogEntry } from "./cloud-shared.js";

const models = [
  { label: "Kimi K2.5", value: "kimi-k2.5", description: "", descriptionKey: "cloud-latest-flagship" },
  { label: "Kimi K2", value: "kimi-k2", description: "", descriptionKey: "cloud-balanced-default" },
  { label: "Kimi Thinking Preview", value: "kimi-thinking-preview", description: "", descriptionKey: "cloud-reasoning-model" },
  { label: "Moonshot V1 128K", value: "moonshot-v1-128k", description: "", descriptionKey: "cloud-balanced-default" },
  { label: "Moonshot V1 32K", value: "moonshot-v1-32k", description: "", descriptionKey: "cloud-fast-stable" },
  { label: "Moonshot V1 8K", value: "moonshot-v1-8k", description: "", descriptionKey: "cloud-fast-stable" },
  { label: "Kimi Latest 8K", value: "kimi-latest-8k", description: "", descriptionKey: "cloud-fast-latest" },
  { label: "Kimi Latest 32K", value: "kimi-latest-32k", description: "", descriptionKey: "cloud-balanced-default" },
  { label: "Kimi Latest 128K", value: "kimi-latest-128k", description: "", descriptionKey: "cloud-specialized-model" },
  { label: "Kimi Vision Preview", value: "kimi-vision-preview", description: "", descriptionKey: "cloud-multimodal-model" }
];

export const moonshotCatalog: CloudProviderCatalogEntry = {
  label: "Moonshot",
  value: "moonshot",
  description: "",
  descriptionKey: "moonshot",
  models
};
