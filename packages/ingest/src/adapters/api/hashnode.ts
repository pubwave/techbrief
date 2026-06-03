import { sanitizeArticleText, type FeedArticle, type SourceDefinition } from "@techbrief/shared";
import { createArticleId, isFresh, sortByPublishedDate } from "../shared/article-utils.js";
import { normalizePublishedAt } from "../shared/date-utils.js";
import { sourceFetchSignal } from "../shared/fetch-timeout.js";

interface HashnodeResponse {
  data?: {
    publication?: {
      posts?: {
        edges?: Array<{
          node?: {
            title?: string;
            brief?: string;
            slug?: string;
            publishedAt?: string;
            url?: string;
            coverImage?: { url?: string };
            author?: { name?: string };
            tags?: Array<{ name?: string }>;
            content?: { markdown?: string };
          };
        }>;
      };
    };
  };
}

interface HashnodePostNode {
  title?: string;
  brief?: string;
  slug?: string;
  publishedAt?: string;
  url?: string;
  coverImage?: { url?: string };
  author?: { name?: string };
  tags?: Array<{ name?: string }>;
  content?: { markdown?: string };
}

function buildHashnodeQuery(host: string): string {
  return `
    query PublicationPosts {
      publication(host: "${host}") {
        posts(first: 20) {
          edges {
            node {
              title
              brief
              slug
              url
              publishedAt
              coverImage {
                url
              }
              author {
                name
              }
              tags {
                name
              }
              content {
                markdown
              }
            }
          }
        }
      }
    }
  `;
}

function mapHashnodeNodeToArticle(source: SourceDefinition, node: HashnodePostNode): FeedArticle | null {
  const title = sanitizeArticleText(node.title);
  const summary = sanitizeArticleText(node.brief);
  const author = sanitizeArticleText(node.author?.name);
  const originalUrl =
    sanitizeArticleText(node.url) ?? (node.slug ? new URL(node.slug, source.homepage).toString() : null);
  const publishedAt = normalizePublishedAt(node.publishedAt);

  if (!title || !originalUrl || !publishedAt) {
    return null;
  }

  return {
    id: createArticleId(source, originalUrl),
    sourceId: source.id,
    sourceName: source.name,
    contentType: source.category,
    declaredContentType: source.category,
    title,
    publishedAt,
    originalUrl,
    tags: (node.tags ?? [])
      .map((tag: { name?: string }) => tag.name)
      .filter((item: string | undefined): item is string => Boolean(item)),
    language: "en",
    ...(summary ? { summary } : {}),
    ...(author ? { author } : {}),
    ...(node.content?.markdown ? { bodyRaw: node.content.markdown } : {}),
    ...(node.coverImage?.url ? { coverImage: node.coverImage.url } : {})
  };
}

export async function fetchHashnodePublicationArticles(
  source: SourceDefinition,
  freshnessDays: number
): Promise<FeedArticle[]> {
  const host = new URL(source.homepage).host;
  const response = await fetch("https://gql.hashnode.com", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "TechBriefBot/0.1 (+https://github.com/pubwave/techbrief)"
    },
    body: JSON.stringify({
      query: buildHashnodeQuery(host)
    }),
    signal: sourceFetchSignal()
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as HashnodeResponse;
  return sortByPublishedDate(
    (payload.data?.publication?.posts?.edges ?? [])
      .map((edge) => (edge.node ? mapHashnodeNodeToArticle(source, edge.node) : null))
      .filter((item): item is FeedArticle => item !== null)
      .filter((item) => isFresh(item.publishedAt, freshnessDays))
  );
}
