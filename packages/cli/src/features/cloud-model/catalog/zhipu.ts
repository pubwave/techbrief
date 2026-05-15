import type { CloudProviderCatalogEntry } from "./cloud-shared.js";

const models = [
  { label: "GLM 4.7", value: "glm-4.7", description: "", descriptionKey: "cloud-latest-flagship" },
  { label: "GLM 4.6", value: "glm-4.6", description: "", descriptionKey: "cloud-balanced-default" },
  { label: "GLM 4.5", value: "glm-4.5", description: "", descriptionKey: "cloud-balanced-default" },
  { label: "GLM 4.5 Air", value: "glm-4.5-air", description: "", descriptionKey: "cloud-fast-stable" },
  { label: "GLM 4.5 Flash", value: "glm-4.5-flash", description: "", descriptionKey: "cloud-fast-latest" },
  { label: "GLM 4.5V", value: "glm-4.5v", description: "", descriptionKey: "cloud-multimodal-model" },
  { label: "GLM Z1 Air", value: "glm-z1-air", description: "", descriptionKey: "cloud-reasoning-model" },
  { label: "GLM Z1 Flash", value: "glm-z1-flash", description: "", descriptionKey: "cloud-reasoning-model" },
  { label: "GLM 4 Air 250414", value: "glm-4-air-250414", description: "", descriptionKey: "cloud-legacy-stable" },
  { label: "CodeGeeX 4", value: "codegeex-4", description: "", descriptionKey: "cloud-coding-model" }
];

export const zhipuCatalog: CloudProviderCatalogEntry = {
  label: "Zhipu",
  value: "zhipu",
  description: "",
  descriptionKey: "zhipu",
  models
};
