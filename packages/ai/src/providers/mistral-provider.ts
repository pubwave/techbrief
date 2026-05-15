import type { AiConfig } from "@techbrief/shared";
import { MISTRAL_PROVIDER_DEFINITION } from "./openai-compatible-definitions.js";
import { OpenAiCompatibleProviderBase } from "./openai-compatible-provider-base.js";

export class MistralProvider extends OpenAiCompatibleProviderBase {
  constructor(config: AiConfig) {
    super(config, MISTRAL_PROVIDER_DEFINITION);
  }
}
