import type { AiConfig } from "@techbrief/shared";
import { DEEPSEEK_PROVIDER_DEFINITION } from "./openai-compatible-definitions.js";
import { OpenAiCompatibleProviderBase } from "./openai-compatible-provider-base.js";

export class DeepSeekProvider extends OpenAiCompatibleProviderBase {
  constructor(config: AiConfig) {
    super(config, DEEPSEEK_PROVIDER_DEFINITION);
  }
}
