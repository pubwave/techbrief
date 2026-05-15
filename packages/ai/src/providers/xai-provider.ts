import type { AiConfig } from "@techbrief/shared";
import { XAI_PROVIDER_DEFINITION } from "./openai-compatible-definitions.js";
import { OpenAiCompatibleProviderBase } from "./openai-compatible-provider-base.js";

export class XAiProvider extends OpenAiCompatibleProviderBase {
  constructor(config: AiConfig) {
    super(config, XAI_PROVIDER_DEFINITION);
  }
}
