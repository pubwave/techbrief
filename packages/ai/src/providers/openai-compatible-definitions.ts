import type { ProviderCapabilities } from "./provider-capabilities.js";
import { DEFAULT_REMOTE_PROVIDER_CAPABILITIES, MINIMAX_PROVIDER_CAPABILITIES } from "./provider-capabilities.js";

export interface OpenAiCompatibleProviderDefinition {
  provider: string;
  baseUrl: string;
  availabilityDetail: string;
  probeUrl?: string;
  capabilities: ProviderCapabilities;
}

export const OPENROUTER_PROVIDER_DEFINITION: OpenAiCompatibleProviderDefinition = {
  provider: "openrouter",
  baseUrl: "https://openrouter.ai/api/v1/chat/completions",
  availabilityDetail: "Set API key in techbrief config",
  capabilities: DEFAULT_REMOTE_PROVIDER_CAPABILITIES
};

export const GOOGLE_PROVIDER_DEFINITION: OpenAiCompatibleProviderDefinition = {
  provider: "google",
  baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
  availabilityDetail: "Set API key in techbrief config",
  capabilities: DEFAULT_REMOTE_PROVIDER_CAPABILITIES
};

export const META_PROVIDER_DEFINITION: OpenAiCompatibleProviderDefinition = {
  provider: "meta",
  baseUrl: "https://api.llama.com/compat/v1/chat/completions",
  availabilityDetail: "Set API key in techbrief config",
  capabilities: DEFAULT_REMOTE_PROVIDER_CAPABILITIES
};

export const XAI_PROVIDER_DEFINITION: OpenAiCompatibleProviderDefinition = {
  provider: "xai",
  baseUrl: "https://api.x.ai/v1/chat/completions",
  availabilityDetail: "Set API key in techbrief config",
  capabilities: DEFAULT_REMOTE_PROVIDER_CAPABILITIES
};

export const MISTRAL_PROVIDER_DEFINITION: OpenAiCompatibleProviderDefinition = {
  provider: "mistral",
  baseUrl: "https://api.mistral.ai/v1/chat/completions",
  availabilityDetail: "Set API key in techbrief config",
  capabilities: DEFAULT_REMOTE_PROVIDER_CAPABILITIES
};

export const ALIBABA_PROVIDER_DEFINITION: OpenAiCompatibleProviderDefinition = {
  provider: "alibaba",
  baseUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
  availabilityDetail: "Set API key in techbrief config",
  capabilities: DEFAULT_REMOTE_PROVIDER_CAPABILITIES
};

export const BYTEDANCE_PROVIDER_DEFINITION: OpenAiCompatibleProviderDefinition = {
  provider: "bytedance",
  baseUrl: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
  availabilityDetail: "Set API key in techbrief config",
  capabilities: DEFAULT_REMOTE_PROVIDER_CAPABILITIES
};

export const DEEPSEEK_PROVIDER_DEFINITION: OpenAiCompatibleProviderDefinition = {
  provider: "deepseek",
  baseUrl: "https://api.deepseek.com/chat/completions",
  availabilityDetail: "Set API key in techbrief config",
  capabilities: DEFAULT_REMOTE_PROVIDER_CAPABILITIES
};

export const ZHIPU_PROVIDER_DEFINITION: OpenAiCompatibleProviderDefinition = {
  provider: "zhipu",
  baseUrl: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
  availabilityDetail: "Set API key in techbrief config",
  capabilities: DEFAULT_REMOTE_PROVIDER_CAPABILITIES
};

export const MINIMAX_PROVIDER_DEFINITION: OpenAiCompatibleProviderDefinition = {
  provider: "minimax",
  baseUrl: "https://api.minimax.io/v1/text/chatcompletion_v2",
  availabilityDetail: "Set API key in techbrief config",
  probeUrl: "https://api.minimax.io/v1/text/chatcompletion_v2",
  capabilities: MINIMAX_PROVIDER_CAPABILITIES
};

export const MOONSHOT_PROVIDER_DEFINITION: OpenAiCompatibleProviderDefinition = {
  provider: "moonshot",
  baseUrl: "https://api.moonshot.cn/v1/chat/completions",
  availabilityDetail: "Set API key in techbrief config",
  capabilities: DEFAULT_REMOTE_PROVIDER_CAPABILITIES
};
