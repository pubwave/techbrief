import type { AiConfig } from "@techbrief/shared";
import { ALIBABA_PROVIDER_DEFINITION } from "./openai-compatible-definitions.js";
import { OpenAiCompatibleProviderBase } from "./openai-compatible-provider-base.js";

export class AlibabaProvider extends OpenAiCompatibleProviderBase {
  constructor(config: AiConfig) {
    super(config, ALIBABA_PROVIDER_DEFINITION);
  }
}
