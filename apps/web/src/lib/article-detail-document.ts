import { buildDetailDocument } from "@techbrief/converter";
import type { Locale, Strings } from "../i18n/types";
import { formatRelativeTimestamp, getArticleTagLabels } from "./format";
import { getSourceColor } from "../components/SourceAvatar";
import type { FeedArticle } from "../types/feed";

export function buildArticleDetailDocument(article: FeedArticle, locale: Locale, strings: Strings) {
  const [channelLabel, sourceLabel] = getArticleTagLabels(article, strings);
  const sourceAccent = getSourceColor(article.sourceName);
  const metadata = [
    article.author,
    formatRelativeTimestamp(article.publishedAt, locale)
  ].filter(Boolean) as string[];
  const translationStreamingActive = article.translationStreaming?.active === true;
  const streamingBodyDocument = article.translationStreaming?.bodyTiptapJson;
  const streamingBodyFallback = article.translationStreaming?.bodyNormalized;
  const bodyDocument = translationStreamingActive
    ? streamingBodyDocument
    : streamingBodyDocument ?? article.bodyTiptapJson;
  const bodyFallback = translationStreamingActive
    ? streamingBodyFallback ?? strings.loading
    : streamingBodyFallback ?? article.bodyNormalized ?? article.summary ?? "";
  const summary = translationStreamingActive ? strings.loading : article.summary;

  return buildDetailDocument({
    title: article.title,
    metadata,
    metadataTags: [
      {
        label: channelLabel,
        tone: "primary",
        variant: "solid",
        size: "md",
        backgroundColor: "var(--tb-accent-soft)",
        textColor: "var(--tb-accent)",
        borderColor: "var(--tb-accent-soft)"
      },
      {
        label: sourceLabel,
        tone: "primary",
        variant: "solid",
        size: "md",
        backgroundColor: `${sourceAccent}1a`,
        textColor: sourceAccent,
        borderColor: `${sourceAccent}33`
      }
    ],
    bodyFallback,
    ...(summary ? { summary } : {}),
    ...(bodyDocument ? { bodyDocument } : {})
  });
}
