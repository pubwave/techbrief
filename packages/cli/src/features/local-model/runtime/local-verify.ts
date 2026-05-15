import { resolveDefaultLocalBaseUrl } from "@techbrief/ai";

const LOCAL_MODEL_VERIFICATION_TIMEOUT_MS = 60_000;
const LOCAL_MODEL_VERIFICATION_ATTEMPTS = 2;

interface VerificationResponse {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
}

interface VerificationPayload {
  ok?: boolean;
}

export async function verifyLocalModelReady(model: string): Promise<{ ok: boolean; detail?: string }> {
  let lastDetail: string | undefined;

  for (let attempt = 0; attempt < LOCAL_MODEL_VERIFICATION_ATTEMPTS; attempt += 1) {
    const result = await runVerificationRequest(model);
    if (result.ok) {
      return result;
    }
    lastDetail = result.detail;
  }

  return {
    ok: false,
    detail: lastDetail ?? "verification failed"
  };
}

async function runVerificationRequest(model: string): Promise<{ ok: boolean; detail?: string }> {
  try {
    const response = await fetch(resolveDefaultLocalBaseUrl(), {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "Return valid JSON only."
          },
          {
            role: "user",
            content: 'Return {"ok":true}.'
          }
        ],
        response_format: {
          type: "json_object"
        }
      }),
      signal: AbortSignal.timeout(LOCAL_MODEL_VERIFICATION_TIMEOUT_MS)
    });

    if (!response.ok) {
      return {
        ok: false,
        detail: `verification request failed with ${response.status}`
      };
    }

    const payload = (await response.json()) as VerificationResponse;
    const content = extractMessage(payload);
    const verificationPayload = parseVerificationPayload(content);
    if (verificationPayload?.ok !== true) {
      return {
        ok: false,
        detail: "verification response did not contain the expected JSON payload"
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      detail: error instanceof Error ? error.message : "verification failed"
    };
  }
}

function extractMessage(payload: VerificationResponse): string {
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .filter((item) => item.type === "text" && typeof item.text === "string")
      .map((item) => item.text?.trim() ?? "")
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  return "";
}

function parseVerificationPayload(content: string): VerificationPayload | null {
  const normalized = content.trim();
  if (!normalized) {
    return null;
  }

  const candidates = [
    normalized,
    stripCodeFence(normalized),
    extractJsonObject(normalized)
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as VerificationPayload;
    } catch {
      // Try the next candidate.
    }
  }

  return null;
}

function stripCodeFence(content: string): string | null {
  const match = content.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return match?.[1]?.trim() || null;
}

function extractJsonObject(content: string): string | null {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start < 0 || end < start) {
    return null;
  }

  return content.slice(start, end + 1).trim();
}
