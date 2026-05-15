import type { CloudProviderCatalogEntry } from "./cloud-shared.js";

const models = [
  { label: "Claude Opus 4.1", value: "claude-opus-4-1", description: "", descriptionKey: "cloud-latest-flagship" },
  { label: "Claude Opus 4.1 (20250805)", value: "claude-opus-4-1-20250805", description: "", descriptionKey: "cloud-latest-flagship" },
  { label: "Claude Opus 4", value: "claude-opus-4-0", description: "", descriptionKey: "cloud-reasoning-model" },
  { label: "Claude Opus 4 (20250514)", value: "claude-opus-4-20250514", description: "", descriptionKey: "cloud-reasoning-model" },
  { label: "Claude Sonnet 4", value: "claude-sonnet-4-0", description: "", descriptionKey: "cloud-balanced-default" },
  { label: "Claude Sonnet 4 (20250514)", value: "claude-sonnet-4-20250514", description: "", descriptionKey: "cloud-balanced-default" },
  { label: "Claude Sonnet 3.7", value: "claude-3-7-sonnet-latest", description: "", descriptionKey: "cloud-legacy-stable" },
  { label: "Claude Sonnet 3.7 (20250219)", value: "claude-3-7-sonnet-20250219", description: "", descriptionKey: "cloud-legacy-stable" },
  { label: "Claude 3.5 Sonnet", value: "claude-3-5-sonnet-latest", description: "", descriptionKey: "cloud-legacy-stable" },
  { label: "Claude 3.5 Haiku", value: "claude-3-5-haiku-latest", description: "", descriptionKey: "cloud-fast-stable" }
];

export const anthropicCatalog: CloudProviderCatalogEntry = {
  label: "Anthropic",
  value: "anthropic",
  description: "Hosted Claude models.",
  models
};
