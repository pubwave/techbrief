import type { ModelChoice } from "../index.js";

export const recommendedLocalModelChoicesForTranslation: ModelChoice[] = [
  {
    label: "qwen2.5:7b",
    value: "qwen2.5:7b",
    description: "Strong multilingual open-source default for local deployment."
  },
  {
    label: "qwen2.5:14b",
    value: "qwen2.5:14b",
    description: "Stronger general-purpose local Qwen when you can afford more memory."
  },
  {
    label: "qwen3:8b",
    value: "qwen3:8b",
    description: "Newer balanced Qwen option with stronger reasoning."
  }
];

export const additionalLocalModelChoicesForTranslation: ModelChoice[] = [
  {
    label: "llama3.1:8b",
    value: "llama3.1:8b",
    description: "Balanced general local model with broad ecosystem support."
  },
  {
    label: "phi4:14b",
    value: "phi4:14b",
    description: "Compact but stronger Microsoft local model for reasoning and writing."
  },
  {
    label: "mistral-nemo:12b",
    value: "mistral-nemo:12b",
    description: "Solid midsize local model with a good speed-quality tradeoff."
  },
  {
    label: "gemma3:12b",
    value: "gemma3:12b",
    description: "Modern Gemma option with stronger overall quality than Gemma 2."
  }
];

export const supportedLocalModelChoices: ModelChoice[] = [
  ...recommendedLocalModelChoicesForTranslation,
  ...additionalLocalModelChoicesForTranslation
];

const supportedLocalModelValues = new Set(supportedLocalModelChoices.map((choice) => choice.value));

export function isSupportedLocalModelChoice(model: string): boolean {
  return supportedLocalModelValues.has(model);
}
