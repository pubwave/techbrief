import type { AiConfig } from "@techbrief/shared";
import { GOOGLE_PROVIDER_DEFINITION } from "./openai-compatible-definitions.js";
import { OpenAiCompatibleProviderBase } from "./openai-compatible-provider-base.js";

export class GoogleProvider extends OpenAiCompatibleProviderBase {
  constructor(config: AiConfig) {
    super(config, GOOGLE_PROVIDER_DEFINITION);
  }
}
