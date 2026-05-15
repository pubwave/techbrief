import type { AiConfig } from "@techbrief/shared";
import { MOONSHOT_PROVIDER_DEFINITION } from "./openai-compatible-definitions.js";
import { OpenAiCompatibleProviderBase } from "./openai-compatible-provider-base.js";

export class MoonshotProvider extends OpenAiCompatibleProviderBase {
  constructor(config: AiConfig) {
    super(config, MOONSHOT_PROVIDER_DEFINITION);
  }
}
