import type { AiConfig } from "@techbrief/shared";
import { META_PROVIDER_DEFINITION } from "./openai-compatible-definitions.js";
import { OpenAiCompatibleProviderBase } from "./openai-compatible-provider-base.js";

export class MetaProvider extends OpenAiCompatibleProviderBase {
  constructor(config: AiConfig) {
    super(config, META_PROVIDER_DEFINITION);
  }
}
