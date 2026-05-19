#!/usr/bin/env node
import { createPubwaveCli, localProjectDir, type MobileWorkspaceProvider } from "@pubwave/cli";
import type { AppConfig } from "@techbrief/shared";
import { resolveCliAppHome } from "./shared/paths/app-home.js";
import { mobileAppRoot, resolveDevelopmentWorkspaceRoot } from "./shared/paths/workspace.js";
import { pubwaveCliConfig } from "./pubwave-cli-config.js";
import { techbriefCustomSteps } from "./pubwave-setup-steps.js";
import { techbriefStages } from "./pubwave-stages.js";
import { techbriefRuntimeHooks } from "./pubwave-runtime-hooks.js";
import { techbriefCommands } from "./pubwave-commands.js";
import { techbriefDefaultCommand } from "./pubwave-default-command.js";
import { templateArchive } from "./pubwave-mobile-workspace.js";
import { runSessionCleanupTasks } from "./shared/process/session-cleanup.js";
import packageJson from "../package.json" with { type: "json" };

const CLI_VERSION = packageJson.version;

process.env.TECHBRIEF_HOME = process.env.TECHBRIEF_HOME?.trim() || resolveCliAppHome();

function handleShutdown(): void {
  runSessionCleanupTasks().then(() => process.exit(0)).catch(() => process.exit(1));
}
process.once("SIGINT", handleShutdown);
process.once("SIGTERM", handleShutdown);

function resolveFlutterWorkspaceProvider(): MobileWorkspaceProvider {
  const developmentWorkspace = resolveDevelopmentWorkspaceRoot();
  if (developmentWorkspace) {
    return localProjectDir({ projectDir: mobileAppRoot });
  }
  const templateUrl = process.env.TECHBRIEF_TEMPLATE_URL?.trim();
  return templateArchive({ ...(templateUrl ? { templateUrl } : {}) });
}

const cli = createPubwaveCli<AppConfig>({
  app: {
    name: "TechBrief",
    command: "techbrief",
    version: CLI_VERSION,
    homeDirName: ".techbrief",
    envPrefix: "TECHBRIEF",
    workspaceMarkers: ["package.json"]
  },
  config: pubwaveCliConfig,
  features: {
    setup: {
      customSteps: techbriefCustomSteps,
      stages: techbriefStages
    },
    cloudModel: true,
    localModel: true,
    mobile: {
      flutter: {
        projectDir: mobileAppRoot,
        workspaceProvider: resolveFlutterWorkspaceProvider()
      }
    },
    runtime: techbriefRuntimeHooks
  },
  commands: techbriefCommands,
  defaultCommand: techbriefDefaultCommand
});

await cli.run(process.argv.slice(2));
