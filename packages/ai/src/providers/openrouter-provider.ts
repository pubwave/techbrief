import type { AiConfig } from "@techbrief/shared";
import { OPENROUTER_PROVIDER_DEFINITION } from "./openai-compatible-definitions.js";
import { OpenAiCompatibleProviderBase } from "./openai-compatible-provider-base.js";

export class OpenRouterProvider extends OpenAiCompatibleProviderBase {
  constructor(config: AiConfig) {
    super(config, OPENROUTER_PROVIDER_DEFINITION);
  }
}
