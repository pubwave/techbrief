import type { CloudProviderCatalogEntry } from "./cloud-shared.js";

const models = [
  { label: "Llama 4 Maverick", value: "Llama-4-Maverick-17B-128E-Instruct-FP8", description: "", descriptionKey: "cloud-latest-flagship" },
  { label: "Llama 4 Scout", value: "Llama-4-Scout-17B-16E-Instruct", description: "", descriptionKey: "cloud-balanced-default" },
  { label: "Llama 3.3 70B Instruct", value: "Llama-3.3-70B-Instruct", description: "", descriptionKey: "cloud-open-model" },
  { label: "Llama 3.2 90B Vision", value: "Llama-3.2-90B-Vision-Instruct", description: "", descriptionKey: "cloud-multimodal-model" },
  { label: "Llama 3.2 11B Vision", value: "Llama-3.2-11B-Vision-Instruct", description: "", descriptionKey: "cloud-multimodal-model" },
  { label: "Llama 3.1 405B Instruct", value: "Llama-3.1-405B-Instruct", description: "", descriptionKey: "cloud-open-model" },
  { label: "Llama 3.1 70B Instruct", value: "Llama-3.1-70B-Instruct", description: "", descriptionKey: "cloud-open-model" },
  { label: "Llama 3.1 8B Instruct", value: "Llama-3.1-8B-Instruct", description: "", descriptionKey: "cloud-fast-stable" },
  { label: "Llama 3.3 8B Instruct", value: "Llama-3.3-8B-Instruct", description: "", descriptionKey: "cloud-fast-stable" },
  { label: "Llama Guard 4 12B", value: "Llama-Guard-4-12B", description: "", descriptionKey: "cloud-specialized-model" }
];

export const metaCatalog: CloudProviderCatalogEntry = {
  label: "Meta",
  value: "meta",
  description: "",
  descriptionKey: "meta",
  models
};
