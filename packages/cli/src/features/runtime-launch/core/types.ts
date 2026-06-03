import type { FeedArticle } from "@techbrief/shared";
import type { LocalModelRuntime } from "@pubwave/cli";
import type { WizardLocale } from "../../../shared/i18n/wizard/index.js";
import type { ArticleProcessingProgress } from "../sync/article-processing-progress.js";

export interface LaunchInput {
  apiPort?: number;
  webPort?: number;
  host?: string;
  localModelRuntime?: LocalModelRuntime;
  noOpen?: boolean;
  session?: boolean;
  locale?: WizardLocale;
  templateUrl?: string;
  onProgress?: (stage: string) => void;
  onOutput?: (line: string, stream: "stdout" | "stderr") => void | Promise<void>;
  onProgressText?: (text: string) => void | Promise<void>;
  onServicesReady?: (input: {
    apiUrl: string;
    webUrl: string;
    runtimeRoot: string;
    workspaceDir: string;
  }) => void | Promise<void>;
  onArticleProcessingProgress?: (progress: ArticleProcessingProgress) => void | Promise<void>;
  onArticleStatus?: (article: FeedArticle, status: "processing" | "completed" | "saved") => void | Promise<void>;
  onArticleSaved?: (article: FeedArticle, index: number, total: number) => void | Promise<void>;
}

export interface LaunchResult {
  ok: boolean;
  apiUrl: string;
  webUrl: string;
  runtimeRoot: string;
  workspaceDir: string;
  sync: {
    ok: boolean;
    detail: string;
    superseded?: boolean;
  };
  steps: Array<{ label: string; ok: boolean; detail: string }>;
}

export interface LaunchHandle {
  ok: boolean;
  apiUrl: string;
  webUrl: string;
  runtimeRoot: string;
  workspaceDir: string;
  sync: LaunchResult["sync"];
  steps: LaunchStep[];
  startServices(): Promise<LaunchResult>;
}

export interface LaunchStep {
  label: string;
  ok: boolean;
  detail: string;
}
