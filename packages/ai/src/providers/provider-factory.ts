import type { AiConfig } from "@techbrief/shared";
import type { AiProvider } from "../types.js";
import { AlibabaProvider } from "./alibaba-provider.js";
import { AnthropicProvider } from "./anthropic-provider.js";
import { ByteDanceProvider } from "./bytedance-provider.js";
import { DeepSeekProvider } from "./deepseek-provider.js";
import { FallbackAiProvider } from "./fallback-provider.js";
import { GoogleProvider } from "./google-provider.js";
import { LocalProvider } from "./local-provider.js";
import { MetaProvider } from "./meta-provider.js";
import { MiniMaxProvider } from "./minimax-provider.js";
import { MistralProvider } from "./mistral-provider.js";
import { MoonshotProvider } from "./moonshot-provider.js";
import { OpenAiProvider } from "./openai-provider.js";
import { OpenRouterProvider } from "./openrouter-provider.js";
import { ResilientAiProvider } from "./resilient-provider.js";
import { XAiProvider } from "./xai-provider.js";
import { ZhiPuProvider } from "./zhipu-provider.js";

function createPrimaryProvider(config: AiConfig): AiProvider | null {
  switch (config.provider) {
    case "openai":
      return new OpenAiProvider({
        provider: "openai",
        model: config.model,
        apiKey: config.apiKey,
        baseUrl: "https://api.openai.com/v1/responses"
      });
    case "anthropic":
      return new AnthropicProvider({
        provider: "anthropic",
        model: config.model,
        apiKey: config.apiKey,
        baseUrl: "https://api.anthropic.com/v1/messages"
      });
    case "openrouter":
      return new OpenRouterProvider(config);
    case "google":
      return new GoogleProvider(config);
    case "meta":
      return new MetaProvider(config);
    case "xai":
      return new XAiProvider(config);
    case "mistral":
      return new MistralProvider(config);
    case "alibaba":
      return new AlibabaProvider(config);
    case "bytedance":
      return new ByteDanceProvider(config);
    case "deepseek":
      return new DeepSeekProvider(config);
    case "zhipu":
      return new ZhiPuProvider(config);
    case "minimax":
      return new MiniMaxProvider(config);
    case "moonshot":
      return new MoonshotProvider(config);
    case "local":
      return new LocalProvider(config);
    default:
      return null;
  }
}

export function createAiProvider(config: AiConfig): AiProvider {
  const fallback = new FallbackAiProvider();
  const primary = createPrimaryProvider(config);

  if (!primary) {
    return fallback;
  }

  return new ResilientAiProvider(primary, fallback, config.provider);
}
