import { runFeedSync } from "@techbrief/feed";
import {
  isInitialSyncCompleteForConfig,
  listAllSources,
  loadConfig,
  loadSchedulerRunState,
  markSourceSchedulerRun,
  recordSchedulerSourceFailure,
  recordSchedulerTickFailure
} from "@techbrief/runtime";
import { isCronScheduleDue, isIntervalScheduleDue, resolveSourceSchedulePolicy } from "./policy.js";

export interface SchedulerLogger {
  info?: (message: string) => void;
  error?: (message: string) => void;
}

export interface StartSchedulerInput {
  pollIntervalMs?: number;
  logger?: SchedulerLogger;
}

export interface SchedulerHandle {
  stop: () => void;
}

export function startScheduler(input: StartSchedulerInput = {}): SchedulerHandle {
  let running = false;
  const pollIntervalMs = input.pollIntervalMs ?? 60_000;
  const timer = setInterval(() => {
    void runSchedulerTick(input.logger, () => {
      running = true;
    }, () => {
      running = false;
    }, () => running);
  }, pollIntervalMs);

  void runSchedulerTick(input.logger, () => {
    running = true;
  }, () => {
    running = false;
  }, () => running);

  return {
    stop: () => {
      clearInterval(timer);
    }
  };
}

async function runSchedulerTick(
  logger: SchedulerLogger | undefined,
  onStart: () => void,
  onFinish: () => void,
  isRunning: () => boolean
): Promise<void> {
  if (isRunning()) {
    return;
  }

  onStart();
  try {
    const config = await loadConfig();
    const initialSyncComplete = await isInitialSyncCompleteForConfig(config);
    if (!initialSyncComplete) {
      return;
    }

    const sources = (await listAllSources()).filter((source) => source.state === "builtin" || source.state === "active");
    const state = await loadSchedulerRunState();
    const now = new Date();

    for (const source of sources) {
      const policy = resolveSourceSchedulePolicy(config, source.id);
      const lastRunAt = state.perSourceLastRunAt[source.id];
      const due = policy.mode === "cron"
        ? isCronScheduleDue(lastRunAt, policy.cron ?? "0 */6 * * *", now)
        : isIntervalScheduleDue(lastRunAt, policy.intervalHours ?? 6, now.getTime());

      if (!due) {
        continue;
      }

      try {
        logger?.info?.(`Scheduler syncing source ${source.id}`);
        const result = await runFeedSync({ sourceIds: [source.id] });
        logger?.info?.(
          `Scheduler synced ${source.id}: saved=${result.savedArticles} filtered=${result.filteredArticles.length} skipped=${result.skippedSources.length}`
        );
        await markSourceSchedulerRun(source.id, now.toISOString(), {
          savedArticles: result.savedArticles,
          filteredArticles: result.filteredArticles.length,
          skippedSources: result.skippedSources.length
        });
      } catch (error) {
        const message = error instanceof Error ? error.stack ?? error.message : "Unknown scheduler source error";
        logger?.error?.(`Scheduler source ${source.id} failed: ${message}`);
        await recordSchedulerSourceFailure(source.id, now.toISOString(), message);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.stack ?? error.message : "Unknown scheduler error";
    logger?.error?.(`Scheduler tick failed: ${message}`);
    await recordSchedulerTickFailure(new Date().toISOString(), message);
  } finally {
    onFinish();
  }
}
