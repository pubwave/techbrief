import type { AiConfig } from "@techbrief/shared";
import { resolveDefaultLocalBaseUrl, resolveDefaultLocalOrigin } from "./local-base-url.js";
import { OpenAiCompatibleProviderBase } from "./openai-compatible-provider-base.js";
import { DEFAULT_LOCAL_PROVIDER_CAPABILITIES } from "./provider-capabilities.js";

export class LocalProvider extends OpenAiCompatibleProviderBase {
  static availabilityDetail(): string {
    return `Uses local Ollama default at ${resolveDefaultLocalOrigin()}`;
  }

  constructor(config: AiConfig) {
    super(config, {
      provider: "local",
      baseUrl: resolveDefaultLocalBaseUrl(),
      availabilityDetail: LocalProvider.availabilityDetail(),
      capabilities: DEFAULT_LOCAL_PROVIDER_CAPABILITIES,
      disableReasoning: true
    });
  }
}
