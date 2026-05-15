import { existsSync } from "node:fs";
import { processFiles } from "../../../shared/paths/runtime-paths.js";
import { describeDetachedProcess, ensureDetachedProcessStopped, readLogTail } from "../../../shared/process/process.js";
import { SYNC_LOG_FILE } from "../sync/sync-log.js";

export async function stopRuntimeServices(): Promise<Array<{ name: "api" | "web" | "scheduler"; ok: boolean; detail: string }>> {
  const services: Array<"api" | "web" | "scheduler"> = ["api", "web", "scheduler"];
  const results: Array<{ name: "api" | "web" | "scheduler"; ok: boolean; detail: string }> = [];

  for (const name of services) {
    const files = processFiles(name);
    const description = await describeDetachedProcess(files.pidFile, files.logFile);
    await ensureDetachedProcessStopped(files.pidFile);

    results.push({
      name,
      ok: true,
      detail: description.running
        ? `Stopped pid ${description.pid}.`
        : "No running process was found."
    });
  }

  return results;
}

export async function runtimeServiceStatus(): Promise<Array<{
  name: "api" | "web" | "scheduler" | "sync";
  exists: boolean;
  running: boolean;
  pid: number | null;
  tail: string[];
}>> {
  const services: Array<"api" | "web" | "scheduler"> = ["api", "web", "scheduler"];
  const processDescriptions = await Promise.all(services.map(async (name) => {
    const files = processFiles(name);
    const description = await describeDetachedProcess(files.pidFile, files.logFile);
    return {
      name,
      ...description
    };
  }));

  return [
    ...processDescriptions,
    {
      name: "sync",
      exists: existsSync(SYNC_LOG_FILE),
      running: false,
      pid: null,
      tail: await readLogTail(SYNC_LOG_FILE, 80)
    }
  ];
}
