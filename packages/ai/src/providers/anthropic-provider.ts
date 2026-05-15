import type { FeedArticle } from "@techbrief/shared";
import type { AiOutput, AiProvider, HttpProviderOptions } from "../types.js";
import { createParsedArticleAiOutput } from "./output.js";
import { buildArticlePrompt, buildBodyTranslationPrompt, parseJsonObject } from "./prompt.js";
import { responseIsEventStream, streamAnthropicMessageText } from "./stream-parser.js";

const ANTHROPIC_BODY_MAX_TOKENS = 4096;
const ANTHROPIC_VERSION = "2023-06-01";

interface AnthropicResponse {
  content?: Array<{
    type?: string;
    text?: string;
  }>;
}

function extractText(payload: AnthropicResponse): string {
  return payload.content
    ?.filter((item) => item.type === "text" && typeof item.text === "string")
    .map((item) => item.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n")
    .trim() ?? "";
}

export class AnthropicProvider implements AiProvider {
  constructor(private readonly options: HttpProviderOptions) {}

  async summarizeAndTranslate(article: FeedArticle, targetLanguage: string): Promise<AiOutput> {
    const response = await fetch(this.options.baseUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.options.apiKey ?? "",
        "anthropic-version": ANTHROPIC_VERSION
      },
      body: JSON.stringify({
        model: this.options.model,
        max_tokens: 800,
        system: "Return valid JSON only.",
        messages: [
          {
            role: "user",
            content: buildArticlePrompt(article, targetLanguage)
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic provider request failed with ${response.status}.`);
    }

    const payload = (await response.json()) as AnthropicResponse;
    return createParsedArticleAiOutput({
      parsed: parseJsonObject(extractText(payload)),
      provider: this.options.provider,
      model: this.options.model,
      targetLanguage
    });
  }

  async translateBodyChunk(input: {
    article: FeedArticle;
    body: string;
    targetLanguage: string;
    onDelta?: (delta: string) => void;
  }): Promise<string> {
    const response = await fetch(this.options.baseUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.options.apiKey ?? "",
        "anthropic-version": ANTHROPIC_VERSION,
        accept: "text/event-stream"
      },
      body: JSON.stringify({
        model: this.options.model,
        max_tokens: ANTHROPIC_BODY_MAX_TOKENS,
        system: "Return translated markdown only.",
        stream: true,
        messages: [
          {
            role: "user",
            content: buildBodyTranslationPrompt(input)
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic provider request failed with ${response.status}.`);
    }

    if (!responseIsEventStream(response)) {
      const payload = (await response.json()) as AnthropicResponse;
      return extractText(payload);
    }

    return streamAnthropicMessageText(response, (delta) => input.onDelta?.(delta));
  }
}
