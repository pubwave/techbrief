#!/usr/bin/env node
import { startScheduler } from "@techbrief/scheduler";

const scheduler = startScheduler({
  logger: {
    info: (message) => console.log(message),
    error: (message) => console.error(message)
  }
});

console.log("TechBrief scheduler started.");

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    scheduler.stop();
    process.exit(0);
  });
}
