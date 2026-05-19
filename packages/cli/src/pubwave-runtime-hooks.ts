import type { RuntimeFeatureConfig } from "@pubwave/cli";
import { downView, logsView, statusView } from "./commands/core/views.js";
import { launchView } from "./commands/core/views.js";
import { parseLaunchOptions } from "./pubwave-launch-options.js";

export const techbriefRuntimeHooks: RuntimeFeatureConfig = {
  launch: (_, options) => launchView(parseLaunchOptions(options)),
  status: () => statusView(),
  stop: () => downView(),
  logs: () => logsView()
};
