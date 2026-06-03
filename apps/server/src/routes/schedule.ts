import { loadConfig, loadSchedulerRunState, setGlobalSchedule } from "@techbrief/runtime";
import { DEFAULT_SCHEDULE_CRON, DEFAULT_SCHEDULE_INTERVAL_MINUTES, MIN_SCHEDULE_INTERVAL_MINUTES } from "@techbrief/shared";
import type { RequestContext } from "../http.js";
import { sendJson } from "../http.js";
import { readJsonBody } from "../body.js";

interface ScheduleUpdateInput {
  mode: "interval" | "cron";
  intervalMinutes?: number;
  cron?: string;
}

export async function handleScheduleRoute({ request, response }: RequestContext): Promise<void> {
  if (request.method === "GET") {
    const [config, runState] = await Promise.all([loadConfig(), loadSchedulerRunState()]);
    // lastSyncAt lets the client anchor a "next sync in MM:SS" countdown to the
    // real last scheduler run instead of guessing from page-load time.
    sendJson(response, 200, {
      ...config.schedule,
      lastSyncAt: runState.globalLastRunAt ?? null
    });
    return;
  }

  if (request.method === "PUT") {
    const input = await readJsonBody<ScheduleUpdateInput>(request);

    const schedule = await setGlobalSchedule(
      input.mode === "interval"
        ? {
            mode: "interval",
            intervalMinutes: Number.isFinite(input.intervalMinutes)
              ? Math.max(MIN_SCHEDULE_INTERVAL_MINUTES, input.intervalMinutes as number)
              : DEFAULT_SCHEDULE_INTERVAL_MINUTES
          }
        : {
            mode: "cron",
            cron: input.cron ?? DEFAULT_SCHEDULE_CRON
          }
    );
    sendJson(response, 200, schedule);
    return;
  }

  sendJson(response, 405, { error: "Method not allowed." });
}
