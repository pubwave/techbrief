import type { CloudProviderCatalogEntry } from "./cloud-shared.js";

const models = [
  { label: "Doubao Seed 1.6", value: "doubao-seed-1.6", description: "", descriptionKey: "cloud-latest-flagship" },
  { label: "Doubao Seed 1.6 Thinking", value: "doubao-seed-1.6-thinking", description: "", descriptionKey: "cloud-reasoning-model" },
  { label: "Doubao 1.5 Thinking Pro", value: "doubao-1.5-thinking-pro", description: "", descriptionKey: "cloud-reasoning-model" },
  { label: "Doubao 1.5 Pro 256K", value: "doubao-1.5-pro-256k", description: "", descriptionKey: "cloud-balanced-default" },
  { label: "Doubao 1.5 Pro 32K", value: "doubao-1.5-pro-32k", description: "", descriptionKey: "cloud-balanced-default" },
  { label: "Doubao 1.5 Lite 32K", value: "doubao-1.5-lite-32k", description: "", descriptionKey: "cloud-fast-latest" },
  { label: "Doubao 1.5 Vision Pro 32K", value: "doubao-1.5-vision-pro-32k", description: "", descriptionKey: "cloud-multimodal-model" },
  { label: "Doubao 1.5 UI TARS", value: "doubao-1.5-ui-tars", description: "", descriptionKey: "cloud-specialized-model" },
  { label: "Doubao Seed Code", value: "doubao-seed-code", description: "", descriptionKey: "cloud-coding-model" },
  { label: "Doubao Seed 1.5", value: "doubao-seed-1.5", description: "", descriptionKey: "cloud-legacy-stable" }
];

export const byteDanceCatalog: CloudProviderCatalogEntry = {
  label: "ByteDance",
  value: "bytedance",
  description: "",
  descriptionKey: "bytedance",
  models
};
