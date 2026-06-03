import type { FeedArticle } from "@techbrief/shared";
import type { AiOutput, AiProvider, HttpProviderOptions } from "../types.js";
import { createParsedArticleAiOutput } from "./output.js";
import { buildArticlePrompt, buildBodyTranslationPrompt, parseJsonObject } from "./prompt.js";
import { responseIsEventStream, streamChatCompletionContent } from "./stream-parser.js";
import { AI_REQUEST_TIMEOUT_MS } from "./fetch-timeout.js";

interface OpenAiCompatibleResponse {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
}

function extractMessage(payload: OpenAiCompatibleResponse): string {
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content === "string") {
    return stripReasoningBlocks(content);
  }

  if (Array.isArray(content)) {
    return stripReasoningBlocks(
      content
        .filter((item) => item.type === "text" && typeof item.text === "string")
        .map((item) => item.text?.trim() ?? "")
        .filter(Boolean)
        .join("\n")
    );
  }

  return "";
}

/**
 * Remove `<think>…</think>` reasoning blocks that some local OpenAI-compatible
 * servers inline into the message content. Ollama keeps reasoning in a separate
 * field, but llama.cpp/LM Studio/vLLM may emit it inline, which would otherwise
 * pollute the translation and fail target-language validation.
 */
function stripReasoningBlocks(text: string): string {
  // Drop well-formed <think>…</think> blocks, then any stray leading </think>
  // (and everything before it) left over when the opening tag was not captured.
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^[\s\S]*?<\/think>/i, "")
    .trim();
}

export class OpenAiCompatibleProvider implements AiProvider {
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
        messages: [
          {
            role: "system",
            content: "Return valid JSON only."
          },
          {
            role: "user",
            content: buildArticlePrompt(article, targetLanguage)
          }
        ],
        response_format: {
          type: "json_object"
        },
        ...(this.options.disableReasoning ? { reasoning_effort: "none" } : {})
      }),
      signal: AbortSignal.timeout(AI_REQUEST_TIMEOUT_MS)
    });

    if (!response.ok) {
      throw new Error(`${this.options.provider} provider request failed with ${response.status}.`);
    }

    const payload = (await response.json()) as OpenAiCompatibleResponse;
    return createParsedArticleAiOutput({
      parsed: parseJsonObject(extractMessage(payload)),
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
        messages: [
          {
            role: "system",
            content: "Return translated markdown only."
          },
          {
            role: "user",
            content: buildBodyTranslationPrompt(input)
          }
        ],
        stream: true,
        ...(this.options.disableReasoning ? { reasoning_effort: "none" } : {})
      })
    });

    if (!response.ok) {
      throw new Error(`${this.options.provider} provider request failed with ${response.status}.`);
    }

    if (!responseIsEventStream(response)) {
      const payload = (await response.json()) as OpenAiCompatibleResponse;
      return extractMessage(payload);
    }

    const streamed = await streamChatCompletionContent(response, (delta) => input.onDelta?.(delta));
    return stripReasoningBlocks(streamed);
  }
}
