const CONTENT_FIELD_KEYS = [
  "content:encoded",
  "content",
  "encoded"
] as const;

const TEXT_FIELD_KEYS = [
  "#text",
  "__cdata",
  "text",
  "_",
  "$text"
] as const;

export type FeedItemWithContent = Record<string, unknown>;

export function extractFeedItemBody(item: FeedItemWithContent): string | undefined {
  const candidates = CONTENT_FIELD_KEYS
    .map((key) => extractRawTextValue(item[key]))
    .filter((value): value is string => Boolean(value?.trim()));

  return selectLongestText(candidates);
}

function selectLongestText(values: string[]): string | undefined {
  const [best] = values
    .map((value) => value.trim())
    .filter(Boolean)
    .sort((left, right) => right.length - left.length);
  return best;
}

function extractRawTextValue(value: unknown, depth = 0): string | undefined {
  if (depth > 5 || value == null) {
    return undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return selectLongestText(
      value
        .map((entry) => extractRawTextValue(entry, depth + 1))
        .filter((entry): entry is string => Boolean(entry))
    );
  }

  if (typeof value !== "object") {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  for (const key of TEXT_FIELD_KEYS) {
    const text = extractRawTextValue(record[key], depth + 1);
    if (text?.trim()) {
      return text;
    }
  }

  return selectLongestText(
    Object.values(record)
      .map((entry) => extractRawTextValue(entry, depth + 1))
      .filter((entry): entry is string => Boolean(entry))
  );
}
