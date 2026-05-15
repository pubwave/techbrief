import type { AiConfig } from "@techbrief/shared";
import { ZHIPU_PROVIDER_DEFINITION } from "./openai-compatible-definitions.js";
import { OpenAiCompatibleProviderBase } from "./openai-compatible-provider-base.js";

export class ZhiPuProvider extends OpenAiCompatibleProviderBase {
  constructor(config: AiConfig) {
    super(config, ZHIPU_PROVIDER_DEFINITION);
  }
}
