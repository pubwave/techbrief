import { wizardMessage } from "../../../shared/i18n/wizard/index.js";
import type { SetupLaunchFlowInput } from "./types.js";

type LaunchProgressStage =
  | "prepare-runtime"
  | "stop-old-services"
  | "start-api"
  | "wait-api"
  | "sync-feed"
  | "enrich-feed"
  | "start-web"
  | "wait-web"
  | "prepare-mobile";

const launchProgressMessageKeys: Record<
  LaunchProgressStage,
  {
    start: Parameters<typeof wizardMessage>[1];
    done: Parameters<typeof wizardMessage>[1];
  }
> = {
  "prepare-runtime": { start: "progressPrepareRuntime", done: "progressPreparedRuntime" },
  "stop-old-services": { start: "progressStopOldServices", done: "progressStoppedOldServices" },
  "start-api": { start: "progressStartApi", done: "progressStartedApi" },
  "wait-api": { start: "progressWaitApi", done: "progressApiReady" },
  "sync-feed": { start: "progressSyncFeed", done: "progressSyncedFeed" },
  "enrich-feed": { start: "progressProcessArticles", done: "progressProcessedArticles" },
  "start-web": { start: "progressStartWeb", done: "progressStartedWeb" },
  "wait-web": { start: "progressWaitWeb", done: "progressWebReady" },
  "prepare-mobile": { start: "progressPrepareMobile", done: "progressPreparedMobile" }
};

export function appendLaunchProgress(input: SetupLaunchFlowInput, stage: string): void {
  if (!(stage in launchProgressMessageKeys)) {
    return;
  }

  if (stage === "enrich-feed" || stage === "start-web" || stage === "prepare-mobile") {
    input.actions.clearOutput();
  }

  const keys = launchProgressMessageKeys[stage as LaunchProgressStage];
  input.actions.appendProgress(
    wizardMessage(input.locale, keys.start),
    "cyan",
    wizardMessage(input.locale, keys.done)
  );
}
