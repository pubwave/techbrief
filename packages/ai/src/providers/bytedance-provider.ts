import type { AiConfig } from "@techbrief/shared";
import { BYTEDANCE_PROVIDER_DEFINITION } from "./openai-compatible-definitions.js";
import { OpenAiCompatibleProviderBase } from "./openai-compatible-provider-base.js";

export class ByteDanceProvider extends OpenAiCompatibleProviderBase {
  constructor(config: AiConfig) {
    super(config, BYTEDANCE_PROVIDER_DEFINITION);
  }
}
