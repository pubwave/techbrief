import type { AiConfig } from "@techbrief/shared";
import { MINIMAX_PROVIDER_DEFINITION } from "./openai-compatible-definitions.js";
import { OpenAiCompatibleProviderBase } from "./openai-compatible-provider-base.js";

export class MiniMaxProvider extends OpenAiCompatibleProviderBase {
  constructor(config: AiConfig) {
    super(config, MINIMAX_PROVIDER_DEFINITION);
  }
}
