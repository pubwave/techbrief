import type { CliCommandContext, PubwaveCliConfig } from "@pubwave/cli";
import { downView, logsView, statusView } from "./commands/core/views.js";
import { launchView } from "./commands/core/views.js";
import { parseLaunchOptions } from "./pubwave-launch-options.js";

type RuntimeFeatureConfig = {
  launch?: (
    context: CliCommandContext<PubwaveCliConfig>,
    options: Record<string, string | boolean>
  ) => Promise<unknown>;
  status?: (
    context: CliCommandContext<PubwaveCliConfig>,
    options: Record<string, string | boolean>
  ) => Promise<unknown>;
  stop?: (
    context: CliCommandContext<PubwaveCliConfig>,
    options: Record<string, string | boolean>
  ) => Promise<unknown>;
  logs?: (
    context: CliCommandContext<PubwaveCliConfig>,
    options: Record<string, string | boolean>
  ) => Promise<unknown>;
};

export const techbriefRuntimeHooks: RuntimeFeatureConfig = {
  launch: (_, options) => launchView(parseLaunchOptions(options)),
  status: () => statusView(),
  stop: () => downView(),
  logs: () => logsView()
};
