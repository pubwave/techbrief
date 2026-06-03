import type { ContentType, FeedArticle } from "@techbrief/shared";

export interface ArticleRecordRow {
  id: string;
  source_id: string;
  source_name: string;
  content_type: ContentType;
  declared_content_type: ContentType;
  author: string | null;
  published_at: string;
  original_url: string;
  source_url: string | null;
  cover_image: string | null;
  tags_json: string;
  language: string;
}

export interface ArticleContentRow {
  article_id: string;
  title: string;
  summary: string | null;
  body_raw: string | null;
  body_normalized: string | null;
  body_ast_json: string | null;
  body_tiptap_json: string | null;
  content_hash: string;
}

export interface ArticleTranslationRow {
  article_id: string;
  target_language: string;
  translated_title: string | null;
  translated_summary: string | null;
  translated_body_raw: string | null;
  translated_body_normalized: string | null;
  translated_body_ast_json: string | null;
  translated_body_tiptap_json: string | null;
  ai_meta_json: string | null;
}

export interface ArticleProcessingStateRow {
  article_id: string;
  target_language: string;
  stage: string;
  status: string;
  error_message: string | null;
  updated_at: string;
}

export interface StoredArticleRow extends ArticleRecordRow, ArticleContentRow {
  translated_title: string | null;
  translated_summary: string | null;
  translated_body_raw: string | null;
  translated_body_normalized: string | null;
  translated_body_ast_json: string | null;
  translated_body_tiptap_json: string | null;
  ai_meta_json: string | null;
}

export interface StoredArticleQuery {
  category?: string | null;
  preferredLanguage?: string | null;
  sourceId?: string | null;
  since?: string | null;
  search?: string | null;
  offset?: number | null;
  limit?: number | null;
}

export interface StoredArticlePage {
  items: FeedArticle[];
  total: number;
}

export interface ArticleProcessingSnapshot {
  total: number;
  processed: number;
  saved: number;
  processingArticles: FeedArticle[];
}

export interface SyncRunRow {
  id: string;
  target_language: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  failure_message: string | null;
}
