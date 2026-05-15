import type { AiConfig } from "@techbrief/shared";
import type { ProviderAvailability } from "../types.js";
import {
  ANTHROPIC_PROVIDER_CAPABILITIES,
  DEFAULT_REMOTE_PROVIDER_CAPABILITIES,
  type ProviderCapabilities
} from "./provider-capabilities.js";
import {
  ALIBABA_PROVIDER_DEFINITION,
  BYTEDANCE_PROVIDER_DEFINITION,
  DEEPSEEK_PROVIDER_DEFINITION,
  GOOGLE_PROVIDER_DEFINITION,
  META_PROVIDER_DEFINITION,
  MINIMAX_PROVIDER_DEFINITION,
  MISTRAL_PROVIDER_DEFINITION,
  MOONSHOT_PROVIDER_DEFINITION,
  OPENROUTER_PROVIDER_DEFINITION,
  XAI_PROVIDER_DEFINITION,
  ZHIPU_PROVIDER_DEFINITION,
  type OpenAiCompatibleProviderDefinition
} from "./openai-compatible-definitions.js";

const REMOTE_PROVIDER_DEFINITIONS = [
  OPENROUTER_PROVIDER_DEFINITION,
  GOOGLE_PROVIDER_DEFINITION,
  META_PROVIDER_DEFINITION,
  XAI_PROVIDER_DEFINITION,
  MISTRAL_PROVIDER_DEFINITION,
  ALIBABA_PROVIDER_DEFINITION,
  BYTEDANCE_PROVIDER_DEFINITION,
  DEEPSEEK_PROVIDER_DEFINITION,
  ZHIPU_PROVIDER_DEFINITION,
  MINIMAX_PROVIDER_DEFINITION,
  MOONSHOT_PROVIDER_DEFINITION
];

export async function inspectCloudProviderAvailability(config: AiConfig): Promise<ProviderAvailability[]> {
  const openAi = await inspectOpenAiAvailability(config);
  const anthropic = await inspectAnthropicAvailability(config);
  const compatible = await Promise.all(
    REMOTE_PROVIDER_DEFINITIONS.map((definition) => inspectOpenAiCompatibleAvailability(definition, config))
  );

  return [openAi, anthropic, ...compatible];
}

async function inspectOpenAiAvailability(config: AiConfig): Promise<ProviderAvailability> {
  return inspectHttpProviderAvailability({
    provider: "openai",
    selectedProvider: config.provider,
    apiKey: config.provider === "openai" ? config.apiKey : "",
    probeUrl: "https://api.openai.com/v1/models",
    capabilities: DEFAULT_REMOTE_PROVIDER_CAPABILITIES,
    headers: (apiKey) => ({
      authorization: `Bearer ${apiKey}`
    })
  });
}

async function inspectAnthropicAvailability(config: AiConfig): Promise<ProviderAvailability> {
  return inspectHttpProviderAvailability({
    provider: "anthropic",
    selectedProvider: config.provider,
    apiKey: config.provider === "anthropic" ? config.apiKey : "",
    probeUrl: "https://api.anthropic.com/v1/models",
    capabilities: ANTHROPIC_PROVIDER_CAPABILITIES,
    headers: (apiKey) => ({
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    })
  });
}

async function inspectOpenAiCompatibleAvailability(
  definition: OpenAiCompatibleProviderDefinition,
  config: AiConfig
): Promise<ProviderAvailability> {
  const apiKey = config.provider === definition.provider ? config.apiKey : "";
  const probeUrl = definition.probeUrl ?? definition.baseUrl.replace(/\/chat\/completions$/, "/models");

  return inspectHttpProviderAvailability({
    provider: definition.provider,
    selectedProvider: config.provider,
    apiKey,
    probeUrl,
    capabilities: definition.capabilities,
    headers: (resolvedApiKey) => ({
      authorization: `Bearer ${resolvedApiKey}`
    })
  });
}

async function inspectHttpProviderAvailability(input: {
  provider: string;
  selectedProvider: string;
  apiKey: string;
  probeUrl: string;
  capabilities: ProviderCapabilities;
  headers: (apiKey: string) => Record<string, string>;
}): Promise<ProviderAvailability> {
  const configured = input.apiKey.trim().length > 0;
  if (!configured) {
    return {
      provider: input.provider,
      available: false,
      configured: false,
      status: "missing-config",
      detail: "Missing API key in techbrief config.",
      capabilities: input.capabilities
    };
  }

  if (input.selectedProvider !== input.provider) {
    return {
      provider: input.provider,
      available: true,
      configured: true,
      status: "ready",
      detail: "Configured.",
      capabilities: input.capabilities
    };
  }

  try {
    const response = await fetch(input.probeUrl, {
      headers: input.headers(input.apiKey),
      signal: AbortSignal.timeout(2_500)
    });

    if (response.ok) {
      return {
        provider: input.provider,
        available: true,
        configured: true,
        status: "ready",
        detail: "Configured and reachable.",
        capabilities: input.capabilities
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        provider: input.provider,
        available: false,
        configured: true,
        status: "auth-failed",
        detail: `Configured but authentication failed with ${response.status}.`,
        capabilities: input.capabilities
      };
    }

    return {
      provider: input.provider,
      available: false,
      configured: true,
      status: "unreachable",
      detail: `Configured but health probe failed with ${response.status}.`,
      capabilities: input.capabilities
    };
  } catch {
    return {
      provider: input.provider,
      available: false,
      configured: true,
      status: "unreachable",
      detail: "Configured but provider is unreachable.",
      capabilities: input.capabilities
    };
  }
}
