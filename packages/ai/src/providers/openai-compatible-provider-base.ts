import type { AiConfig } from "@techbrief/shared";
import type { HttpProviderOptions } from "../types.js";
import { OpenAiCompatibleProvider } from "./openai-compatible-provider.js";
import type { OpenAiCompatibleProviderDefinition } from "./openai-compatible-definitions.js";

export abstract class OpenAiCompatibleProviderBase extends OpenAiCompatibleProvider {
  constructor(config: AiConfig, definition: OpenAiCompatibleProviderDefinition) {
    super(createOptions(config, definition));
  }
}

function createOptions(config: AiConfig, definition: OpenAiCompatibleProviderDefinition): HttpProviderOptions {
  return {
    provider: definition.provider,
    model: config.model,
    apiKey: config.apiKey,
    baseUrl: definition.baseUrl,
    ...(definition.disableReasoning ? { disableReasoning: true } : {})
  };
}
