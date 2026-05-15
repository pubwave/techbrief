import { runFeedSync } from "@techbrief/feed";
import type { RequestContext } from "../../http.js";
import { sendJson } from "../../http.js";

export async function handleSyncRoute({ response }: RequestContext): Promise<void> {
  const result = await runFeedSync();

  sendJson(response, 200, {
    fetchedSources: result.fetchedSources,
    skippedSources: result.skippedSources,
    filteredArticles: result.filteredArticles.length,
    fetchedArticles: result.preparedArticles,
    savedArticles: result.savedArticles
  });
}
