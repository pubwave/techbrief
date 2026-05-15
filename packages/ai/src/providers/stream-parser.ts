export async function* iterateSseDataPayloads(response: Response): AsyncGenerator<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    let newlineIndex = buffer.indexOf("\n");
    while (newlineIndex >= 0) {
      const rawLine = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;
      if (line.startsWith("data:")) {
        yield line.slice(5).trimStart();
      }

      newlineIndex = buffer.indexOf("\n");
    }
  }

  const tail = buffer.trim();
  if (tail.startsWith("data:")) {
    yield tail.slice(5).trimStart();
  }
}

export async function streamChatCompletionContent(
  response: Response,
  onDelta: (delta: string) => void
): Promise<string> {
  let full = "";

  for await (const payload of iterateSseDataPayloads(response)) {
    if (!payload || payload === "[DONE]") {
      continue;
    }

    const parsed = safeJsonParse<{ choices?: Array<{ delta?: { content?: string | null } }> }>(payload);
    if (!parsed) {
      continue;
    }

    const delta = parsed.choices?.[0]?.delta?.content;
    if (typeof delta === "string" && delta.length > 0) {
      full += delta;
      onDelta(delta);
    }
  }

  return full.trim();
}

export async function streamResponsesApiText(
  response: Response,
  onDelta: (delta: string) => void
): Promise<string> {
  let full = "";

  for await (const payload of iterateSseDataPayloads(response)) {
    if (!payload || payload === "[DONE]") {
      continue;
    }

    const parsed = safeJsonParse<{ type?: string; delta?: string }>(payload);
    if (!parsed) {
      continue;
    }

    if (
      parsed.type === "response.output_text.delta"
      && typeof parsed.delta === "string"
      && parsed.delta.length > 0
    ) {
      full += parsed.delta;
      onDelta(parsed.delta);
    }
  }

  return full.trim();
}

export async function streamAnthropicMessageText(
  response: Response,
  onDelta: (delta: string) => void
): Promise<string> {
  let full = "";

  for await (const payload of iterateSseDataPayloads(response)) {
    if (!payload) {
      continue;
    }

    const parsed = safeJsonParse<{
      type?: string;
      delta?: { type?: string; text?: string };
    }>(payload);
    if (!parsed) {
      continue;
    }

    if (
      parsed.type === "content_block_delta"
      && parsed.delta?.type === "text_delta"
      && typeof parsed.delta.text === "string"
      && parsed.delta.text.length > 0
    ) {
      full += parsed.delta.text;
      onDelta(parsed.delta.text);
    }
  }

  return full.trim();
}

export function responseIsEventStream(response: Response): boolean {
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("event-stream");
}

function safeJsonParse<T>(input: string): T | null {
  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}
