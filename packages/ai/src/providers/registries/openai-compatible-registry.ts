import type { AiConfig } from "@techbrief/shared";
import type { HttpProviderOptions } from "../../types.js";
import type { ProviderAvailabilityDefinition, ProviderDefinition } from "../provider-types.js";

const OPENAI_COMPATIBLE_PROVIDER_DEFINITIONS: ProviderDefinition[] = [
  {
    provider: "openrouter",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    availabilityDetail: "Set API key in techbrief config"
  },
  {
    provider: "google",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    availabilityDetail: "Set API key in techbrief config"
  },
  {
    provider: "meta",
    baseUrl: "https://api.llama.com/compat/v1/chat/completions",
    availabilityDetail: "Set API key in techbrief config"
  },
  {
    provider: "xai",
    baseUrl: "https://api.x.ai/v1/chat/completions",
    availabilityDetail: "Set API key in techbrief config"
  },
  {
    provider: "mistral",
    baseUrl: "https://api.mistral.ai/v1/chat/completions",
    availabilityDetail: "Set API key in techbrief config"
  },
  {
    provider: "alibaba",
    baseUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
    availabilityDetail: "Set API key in techbrief config"
  },
  {
    provider: "bytedance",
    baseUrl: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    availabilityDetail: "Set API key in techbrief config"
  },
  {
    provider: "deepseek",
    baseUrl: "https://api.deepseek.com/chat/completions",
    availabilityDetail: "Set API key in techbrief config"
  },
  {
    provider: "zhipu",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    availabilityDetail: "Set API key in techbrief config"
  },
  {
    provider: "minimax",
    baseUrl: "https://api.minimax.io/v1/text/chatcompletion_v2",
    availabilityDetail: "Set API key in techbrief config"
  },
  {
    provider: "moonshot",
    baseUrl: "https://api.moonshot.cn/v1/chat/completions",
    availabilityDetail: "Set API key in techbrief config"
  }
];

const OPENAI_COMPATIBLE_PROVIDER_MAP = new Map(
  OPENAI_COMPATIBLE_PROVIDER_DEFINITIONS.map((definition) => [definition.provider, definition])
);

export function resolveOpenAiCompatibleProviderOptions(config: AiConfig): HttpProviderOptions | null {
  const definition = OPENAI_COMPATIBLE_PROVIDER_MAP.get(config.provider);
  if (!definition) {
    return null;
  }

  return {
    provider: config.provider,
    model: config.model,
    apiKey: config.apiKey,
    baseUrl: definition.baseUrl
  };
}

export function listOpenAiCompatibleProviderAvailability(): ProviderAvailabilityDefinition[] {
  return OPENAI_COMPATIBLE_PROVIDER_DEFINITIONS.map((definition) => ({
    provider: definition.provider,
    available: false,
    detail: definition.availabilityDetail
  }));
}
