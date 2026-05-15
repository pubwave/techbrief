import type { RequestContext } from "../../http.js";
import { sendJson } from "../../http.js";
import { getArticleById } from "../../db/articles.js";

function parseArticleId(pathname: string): string | null {
  const match = pathname.match(/^\/v1\/feed\/([^/]+)$/);
  return match?.[1] ?? null;
}

export async function handleFeedDetailRoute({ response, url }: RequestContext): Promise<void> {
  const articleId = parseArticleId(url.pathname);
  const preferredLanguage = url.searchParams.get("language");

  if (!articleId) {
    sendJson(response, 404, { error: "Article was not found." });
    return;
  }

  const article = await getArticleById(articleId, preferredLanguage);

  sendJson(response, article ? 200 : 404, article ?? { error: "Article was not found." });
}
