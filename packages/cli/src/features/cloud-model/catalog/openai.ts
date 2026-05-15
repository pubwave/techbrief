import { OPENAI_MODEL_ORDER, type OpenAiModelValue } from "@techbrief/shared";
import type { CloudProviderCatalogEntry } from "./cloud-shared.js";

const openAiModelMetadata: Record<
  OpenAiModelValue,
  { label: string; descriptionKey: string }
> = {
  "gpt-5.2": { label: "GPT-5.2", descriptionKey: "cloud-latest-flagship" },
  "gpt-5.2-pro": { label: "GPT-5.2 Pro", descriptionKey: "cloud-reasoning-model" },
  "gpt-5.2-codex": { label: "GPT-5.2 Codex", descriptionKey: "cloud-coding-model" },
  "gpt-5.2-chat-latest": { label: "GPT-5.2 Chat", descriptionKey: "cloud-balanced-default" },
  "gpt-5": { label: "GPT-5", descriptionKey: "cloud-legacy-stable" },
  "gpt-5-mini": { label: "GPT-5 Mini", descriptionKey: "cloud-fast-latest" },
  "gpt-5-nano": { label: "GPT-5 Nano", descriptionKey: "cloud-fast-stable" },
  "gpt-4.1": { label: "GPT-4.1", descriptionKey: "cloud-balanced-default" },
  "gpt-4.1-mini": { label: "GPT-4.1 Mini", descriptionKey: "cloud-fast-stable" },
  "o3-pro": { label: "o3-pro", descriptionKey: "cloud-reasoning-model" }
};

const models = OPENAI_MODEL_ORDER.map((value) => ({
  label: openAiModelMetadata[value].label,
  value,
  description: "",
  descriptionKey: openAiModelMetadata[value].descriptionKey
}));

export const openAiCatalog: CloudProviderCatalogEntry = {
  label: "OpenAI",
  value: "openai",
  description: "Hosted default with broad model support.",
  models
};
