import type { CloudProviderCatalogEntry } from "./cloud-shared.js";

const models = [
  { label: "Qwen Max", value: "qwen-max", description: "", descriptionKey: "cloud-latest-flagship" },
  { label: "Qwen Plus", value: "qwen-plus", description: "", descriptionKey: "cloud-balanced-default" },
  { label: "Qwen Turbo", value: "qwen-turbo", description: "", descriptionKey: "cloud-fast-latest" },
  { label: "Qwen Long", value: "qwen-long", description: "", descriptionKey: "cloud-specialized-model" },
  { label: "Qwen3 235B A22B Instruct 2507", value: "qwen3-235b-a22b-instruct-2507", description: "", descriptionKey: "cloud-open-model" },
  { label: "Qwen3 235B A22B Thinking 2507", value: "qwen3-235b-a22b-thinking-2507", description: "", descriptionKey: "cloud-reasoning-model" },
  { label: "Qwen3 Coder 480B A35B Instruct", value: "qwen3-coder-480b-a35b-instruct", description: "", descriptionKey: "cloud-coding-model" },
  { label: "Qwen2.5 72B Instruct", value: "qwen2.5-72b-instruct", description: "", descriptionKey: "cloud-legacy-stable" },
  { label: "Qwen2.5 32B Instruct", value: "qwen2.5-32b-instruct", description: "", descriptionKey: "cloud-legacy-stable" },
  { label: "Qwen2.5 14B Instruct", value: "qwen2.5-14b-instruct", description: "", descriptionKey: "cloud-fast-stable" }
];

export const alibabaCatalog: CloudProviderCatalogEntry = {
  label: "Alibaba",
  value: "alibaba",
  description: "",
  descriptionKey: "alibaba",
  models
};
