import type { FeedArticle } from "@techbrief/shared";
import { isFresh, sortByPublishedDate } from "../shared/article-utils.js";
import { extractAuthor, extractPublishedAt, extractSummary, extractTitle } from "./extract.js";
import { extractHtmlBodyContent } from "./body-content.js";
import { extractArticleCandidates } from "./listing.js";
import { mapHtmlDetailToArticle } from "./map-detail.js";
import { getHtmlSourceRule } from "./rules.js";
import type { FetchHtmlSourceArticlesInput, FetchHtmlSourceArticlesResult } from "./types.js";
import { formatFetchError } from "../shared/fetch-error.js";

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "user-agent": "TechBriefBot/0.1 (+https://github.com/pubwave/techbrief)"
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  return response.text();
}

export async function fetchHtmlSourceArticles({
  source,
  freshnessDays
}: FetchHtmlSourceArticlesInput): Promise<FetchHtmlSourceArticlesResult> {
  const rule = getHtmlSourceRule(source);

  if (!rule) {
    return {
      articles: [],
      skippedReason: `No HTML adapter rule is registered for source '${source.id}'.`
    };
  }

  try {
    const listingHtml = await fetchText(rule.listingUrl ?? source.homepage);
    const candidates = extractArticleCandidates(listingHtml, source, rule).slice(0, rule.maxArticles);
    const articles: FeedArticle[] = [];

    for (const candidate of candidates) {
      try {
        const detailHtml = await fetchText(candidate.originalUrl);
        const title = extractTitle(detailHtml, rule.titleSelectors ?? ["h1", "title"]) ?? candidate.title;
        const summary = extractSummary(detailHtml, rule.summarySelectors ?? ["meta[name='description']", "article p"]);
        const author = extractAuthor(detailHtml, rule.authorSelectors ?? ["meta[name='author']", "[rel='author']"]);
        const content = extractHtmlBodyContent(
          detailHtml,
          candidate.originalUrl,
          rule.bodySelectors ?? ["article", "main", ".post-content", ".entry-content"]
        );

        if (!title) {
          continue;
        }

        const publishedAt = extractPublishedAt(detailHtml, rule.dateSelectors ?? ["time[datetime]", "time"]);
        if (!isFresh(publishedAt, freshnessDays)) {
          continue;
        }

        articles.push(
          mapHtmlDetailToArticle(source, {
            originalUrl: candidate.originalUrl,
            title,
            publishedAt,
            ...(summary ? { summary } : {}),
            ...(author ? { author } : {}),
            ...(content.bodyHtml ? { bodyRaw: content.bodyHtml } : {}),
            ...(content.coverImage ? { coverImage: content.coverImage } : {})
          })
        );
      } catch {
        if (candidate.title) {
          const publishedAt = candidate.publishedAt ?? new Date().toISOString();
          if (isFresh(publishedAt, freshnessDays)) {
            articles.push(
              mapHtmlDetailToArticle(source, {
                originalUrl: candidate.originalUrl,
                title: candidate.title,
                publishedAt,
                summary: candidate.summary ?? candidate.title,
                ...(candidate.author ? { author: candidate.author } : {})
              })
            );
          }
        }
      }
    }

    return {
      articles: sortByPublishedDate(articles)
    };
  } catch (error) {
    return {
      articles: [],
      skippedReason: formatFetchError(error)
    };
  }
}
