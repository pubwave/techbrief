export const OPENAI_MODEL_ORDER = [
  "gpt-5.2",
  "gpt-5.2-pro",
  "gpt-5.2-codex",
  "gpt-5.2-chat-latest",
  "gpt-5",
  "gpt-5-mini",
  "gpt-5-nano",
  "gpt-4.1",
  "gpt-4.1-mini",
  "o3-pro"
] as const;

export type OpenAiModelValue = (typeof OPENAI_MODEL_ORDER)[number];

export const DEFAULT_OPENAI_MODEL = OPENAI_MODEL_ORDER[0];
