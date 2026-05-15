import type { CloudProviderCatalogEntry } from "./cloud-shared.js";

const models = [
  { label: "Qwen 3.6 Plus Preview (Free)", value: "qwen/qwen3.6-plus-preview:free", description: "", descriptionKey: "cloud-preview-model" },
  { label: "KAT-Coder-Pro V2", value: "kwaipilot/kat-coder-pro-v2", description: "", descriptionKey: "cloud-coding-model" },
  { label: "Reka Edge", value: "reka/reka-edge", description: "", descriptionKey: "cloud-multimodal-model" },
  { label: "MiMo-V2-Omni", value: "xiaomi/mimo-v2-omni", description: "", descriptionKey: "cloud-multimodal-model" },
  { label: "MiMo-V2-Pro", value: "xiaomi/mimo-v2-pro", description: "", descriptionKey: "cloud-latest-flagship" },
  { label: "MiniMax M2.7", value: "minimax/minimax-m2.7", description: "", descriptionKey: "cloud-balanced-default" },
  { label: "GPT-5.4 Nano", value: "openai/gpt-5.4-nano", description: "", descriptionKey: "cloud-fast-stable" },
  { label: "GPT-5.4 Mini", value: "openai/gpt-5.4-mini", description: "", descriptionKey: "cloud-fast-latest" },
  { label: "Mistral Small 4", value: "mistralai/mistral-small-2603", description: "", descriptionKey: "cloud-balanced-default" },
  { label: "GLM 5 Turbo", value: "z-ai/glm-5-turbo", description: "", descriptionKey: "cloud-fast-latest" }
];

export const openRouterCatalog: CloudProviderCatalogEntry = {
  label: "OpenRouter",
  value: "openrouter",
  description: "Hosted router across multiple providers.",
  models
};
