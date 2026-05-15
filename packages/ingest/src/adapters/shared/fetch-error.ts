export function formatFetchError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Unknown fetch error.";
  }

  const detail = collectErrorDetails(error)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .join(" | ");

  return detail || "Unknown fetch error.";
}

function collectErrorDetails(error: Error): string[] {
  const details: string[] = [error.message];
  const cause = "cause" in error ? (error as Error & { cause?: unknown }).cause : undefined;

  if (cause instanceof Error) {
    details.push(...collectErrorDetails(cause));
  } else if (typeof cause === "string") {
    details.push(cause);
  } else if (cause && typeof cause === "object") {
    const code = "code" in cause ? (cause as { code?: unknown }).code : undefined;
    const message = "message" in cause ? (cause as { message?: unknown }).message : undefined;
    if (typeof code === "string") {
      details.push(code);
    }
    if (typeof message === "string") {
      details.push(message);
    }
  }

  return dedupeDetails(details);
}

function dedupeDetails(details: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const detail of details) {
    if (seen.has(detail)) {
      continue;
    }

    seen.add(detail);
    unique.push(detail);
  }

  return unique;
}
