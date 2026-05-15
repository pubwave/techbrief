import { performInitialFeedSync } from "./feed-sync.js";
import { processArticlesProgressText, syncProgressText, yieldToUi } from "../core/helpers.js";
import type { LaunchInput, LaunchResult, LaunchStep } from "../core/types.js";
import type { WizardLocale } from "../../../shared/i18n/wizard/index.js";

export async function runInitialSyncStage(
  locale: WizardLocale,
  input: LaunchInput,
  steps: LaunchStep[]
): Promise<LaunchResult["sync"]> {
  input.onProgress?.("sync-feed");
  await yieldToUi();
  await input.onProgressText?.(syncProgressText(locale, 0));
  const syncResult = await performInitialFeedSync(locale, {
    onOutput: async (line) => {
      await input.onOutput?.(line, "stdout");
      await yieldToUi();
    },
    onSyncPercent: async (percent) => {
      await input.onProgressText?.(syncProgressText(locale, percent));
      await yieldToUi();
    },
    onProcessStart: async () => {
      input.onProgress?.("enrich-feed");
      await yieldToUi();
    },
    onProcessPercent: async (percent) => {
      await input.onProgressText?.(processArticlesProgressText(locale, percent));
      await yieldToUi();
    },
    onArticleProcessingProgress: async (progress) => {
      await input.onArticleProcessingProgress?.(progress);
      await yieldToUi();
    },
    onArticleStatus: async (article, status) => {
      await input.onArticleStatus?.(article, status);
      await yieldToUi();
    }
  });
  steps.push({
    label: "sync",
    ok: syncResult.ok,
    detail: syncResult.detail
  });
  return syncResult;
}
