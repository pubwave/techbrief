import type { RequestContext } from "../../http.js";
import { sendJson } from "../../http.js";
import { listArticles } from "../../db/articles.js";

export async function handleFeedListRoute({ response, url }: RequestContext): Promise<void> {
  const category = url.searchParams.get("category");
  const preferredLanguage = url.searchParams.get("language");
  const sourceId = url.searchParams.get("sourceId");
  const since = url.searchParams.get("since");
  const search = url.searchParams.get("q");
  const limit = Number.parseInt(url.searchParams.get("limit") ?? "50", 10);
  const offset = Number.parseInt(url.searchParams.get("offset") ?? "0", 10);

  const result = await listArticles({ category, preferredLanguage, sourceId, since, search, offset, limit });

  sendJson(response, 200, {
    items: result.items,
    total: result.total
  });
}
