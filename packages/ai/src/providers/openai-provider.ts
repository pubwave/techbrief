import type { FeedArticle } from "@techbrief/shared";
import type { AiOutput, AiProvider, HttpProviderOptions } from "../types.js";
import { createParsedArticleAiOutput } from "./output.js";
import { buildArticlePrompt, buildBodyTranslationPrompt, parseJsonObject } from "./prompt.js";
import { responseIsEventStream, streamResponsesApiText } from "./stream-parser.js";
import { AI_REQUEST_TIMEOUT_MS } from "./fetch-timeout.js";

interface OpenAiResponse {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
}

function extractOutputText(payload: OpenAiResponse): string {
  if (typeof payload.output_text === "string" && payload.output_text.trim().length > 0) {
    return payload.output_text.trim();
  }

  const parts: string[] = [];

  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        parts.push(content.text);
      }
    }
  }

  return parts.join("\n").trim();
}

export class OpenAiProvider implements AiProvider {
  constructor(private readonly options: HttpProviderOptions) {}

  async summarizeAndTranslate(article: FeedArticle, targetLanguage: string): Promise<AiOutput> {
    const response = await fetch(this.options.baseUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.options.apiKey ?? ""}`
      },
      body: JSON.stringify({
        model: this.options.model,
        input: buildArticlePrompt(article, targetLanguage),
        text: {
          format: {
            type: "json_object"
          }
        }
      }),
      signal: AbortSignal.timeout(AI_REQUEST_TIMEOUT_MS)
    });

    if (!response.ok) {
      throw new Error(`OpenAI provider request failed with ${response.status}.`);
    }

    const payload = (await response.json()) as OpenAiResponse;
    return createParsedArticleAiOutput({
      parsed: parseJsonObject(extractOutputText(payload)),
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
        authorization: `Bearer ${this.options.apiKey ?? ""}`,
        accept: "text/event-stream"
      },
      body: JSON.stringify({
        model: this.options.model,
        input: buildBodyTranslationPrompt(input),
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI provider request failed with ${response.status}.`);
    }

    if (!responseIsEventStream(response)) {
      const payload = (await response.json()) as OpenAiResponse;
      return extractOutputText(payload);
    }

    return streamResponsesApiText(response, (delta) => input.onDelta?.(delta));
  }
}
