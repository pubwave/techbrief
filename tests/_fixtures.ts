import type { FeedArticle, SourceDefinition } from "@techbrief/shared";

// Minimal valid fixtures for unit tests. Cast through `as` so callers only set
// the fields a given test cares about; the runtime never validates the shape.
export function makeArticle(overrides: Partial<FeedArticle> = {}): FeedArticle {
  return {
    id: "id-1",
    sourceId: "src-1",
    sourceName: "Source One",
    contentType: "tech-media",
    declaredContentType: "tech-media",
    title: "A reasonably long article title",
    publishedAt: "2024-03-01T00:00:00.000Z",
    originalUrl: "https://example.com/post",
    tags: [],
    language: "en",
    ...overrides
  } as FeedArticle;
}

export function makeSource(overrides: Partial<SourceDefinition> = {}): SourceDefinition {
  return {
    id: "src-1",
    name: "Source One",
    category: "tech-media",
    preset: "custom",
    state: "enabled",
    access: "public",
    homepage: "https://example.com",
    discoveryMethod: "rss",
    linkScope: "external-allowed",
    description: "",
    tags: [],
    priority: 10,
    ...overrides
  } as SourceDefinition;
}
