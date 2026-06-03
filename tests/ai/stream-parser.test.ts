import { describe, expect, it, vi } from "vitest";
import {
  iterateSseDataPayloads,
  responseIsEventStream,
  streamAnthropicMessageText,
  streamChatCompletionContent,
  streamResponsesApiText
} from "../../packages/ai/src/providers/stream-parser.js";

function sseResponse(body: string): Response {
  return new Response(body, { headers: { "content-type": "text/event-stream" } });
}

describe("responseIsEventStream", () => {
  it("detects an event-stream content type", () => {
    expect(responseIsEventStream(sseResponse(""))).toBe(true);
    expect(responseIsEventStream(new Response("{}", { headers: { "content-type": "application/json" } }))).toBe(false);
  });
});

describe("iterateSseDataPayloads", () => {
  it("yields the data payloads, handling CRLF and a trailing line", async () => {
    const body = "data: one\r\nignored\r\ndata: two\n\ndata: three";
    const out: string[] = [];
    for await (const payload of iterateSseDataPayloads(sseResponse(body))) {
      out.push(payload);
    }
    expect(out).toEqual(["one", "two", "three"]);
  });
});

describe("streamChatCompletionContent", () => {
  it("concatenates delta content and skips [DONE]", async () => {
    const body =
      'data: {"choices":[{"delta":{"content":"Hel"}}]}\n' +
      'data: {"choices":[{"delta":{"content":"lo"}}]}\n' +
      "data: [DONE]\n";
    const onDelta = vi.fn();
    const full = await streamChatCompletionContent(sseResponse(body), onDelta);
    expect(full).toBe("Hello");
    expect(onDelta).toHaveBeenCalledTimes(2);
  });
});

describe("streamResponsesApiText", () => {
  it("collects output_text deltas", async () => {
    const body =
      'data: {"type":"response.output_text.delta","delta":"foo"}\n' +
      'data: {"type":"response.output_text.delta","delta":"bar"}\n' +
      'data: {"type":"response.completed"}\n';
    const full = await streamResponsesApiText(sseResponse(body), () => {});
    expect(full).toBe("foobar");
  });
});

describe("streamAnthropicMessageText", () => {
  it("collects content_block_delta text deltas", async () => {
    const body =
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"A"}}\n' +
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"B"}}\n' +
      'data: {"type":"message_stop"}\n';
    const full = await streamAnthropicMessageText(sseResponse(body), () => {});
    expect(full).toBe("AB");
  });

  it("ignores malformed json lines", async () => {
    const body = "data: not-json\ndata: {\"type\":\"content_block_delta\",\"delta\":{\"type\":\"text_delta\",\"text\":\"ok\"}}\n";
    const full = await streamAnthropicMessageText(sseResponse(body), () => {});
    expect(full).toBe("ok");
  });
});
