import { loadConfig, setGlobalSchedule, setSourceSchedule } from "@techbrief/runtime";
import type { SchedulePolicy } from "@techbrief/shared";
import type { RequestContext } from "../http.js";
import { sendJson } from "../http.js";
import { readJsonBody } from "../body.js";

interface ScheduleUpdateInput {
  mode: "interval" | "cron";
  intervalHours?: number;
  cron?: string;
  timezone?: string;
  sourceId?: string;
}

export async function handleScheduleRoute({ request, response }: RequestContext): Promise<void> {
  if (request.method === "GET") {
    const config = await loadConfig();
    sendJson(response, 200, config.schedule);
    return;
  }

  if (request.method === "PUT") {
    const input = await readJsonBody<ScheduleUpdateInput>(request);

    if (input.sourceId) {
      const policy: SchedulePolicy = input.mode === "interval"
        ? { mode: "interval", intervalHours: input.intervalHours ?? 6 }
        : { mode: "cron", cron: input.cron ?? "0 */6 * * *" };
      const schedule = await setSourceSchedule(input.sourceId, policy);
      sendJson(response, 200, schedule);
      return;
    }

    const schedule = await setGlobalSchedule(
      input.mode === "interval"
        ? {
            mode: "interval",
            intervalHours: input.intervalHours ?? 6,
            ...(input.timezone ? { timezone: input.timezone } : {})
          }
        : {
            mode: "cron",
            cron: input.cron ?? "0 */6 * * *",
            ...(input.timezone ? { timezone: input.timezone } : {})
          }
    );
    sendJson(response, 200, schedule);
    return;
  }

  sendJson(response, 405, { error: "Method not allowed." });
}
