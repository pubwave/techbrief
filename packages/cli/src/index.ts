#!/usr/bin/env node
import { createPubwaveCli, localProjectDir, type MobileWorkspaceProvider } from "@pubwave/cli";
import { requiresAiForLanguage, type AppConfig } from "@techbrief/shared";
import { resolveCliAppHome } from "./shared/paths/app-home.js";
import { mobileAppRoot, resolveDevelopmentWorkspaceRoot } from "./shared/paths/workspace.js";
import { pubwaveCliConfig } from "./pubwave-cli-config.js";
import { techbriefCustomSteps } from "./pubwave-setup-steps.js";
import { getPendingApiUrl, techbriefStages } from "./pubwave-stages.js";
import { techbriefRuntimeHooks } from "./pubwave-runtime-hooks.js";
import { techbriefCommands } from "./pubwave-commands.js";
import { techbriefDefaultCommand } from "./pubwave-default-command.js";
import { techbriefAdditionalRows } from "./pubwave-saved-view.js";
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
      stages: techbriefStages,
      shouldRequireAiSetup: ({ state }) => requiresAiForLanguage(state.language),
      // Full techbrief config rows, shown on BOTH the saved view and the
      // post-setup completion screen (declared once here).
      configRows: techbriefAdditionalRows
    },
    cloudModel: true,
    localModel: true,
    mobile: {
      flutter: {
        projectDir: mobileAppRoot,
        workspaceProvider: resolveFlutterWorkspaceProvider(),
        dartDefines: ({ runtime }: { runtime?: { apiBaseUrl?: string } }) => {
          const url = runtime?.apiBaseUrl ?? getPendingApiUrl();
          return url ? { API_BASE_URL: url } : {};
        }
      }
    },
    runtime: techbriefRuntimeHooks
  },
  commands: techbriefCommands,
  defaultCommand: techbriefDefaultCommand
});

await cli.run(process.argv.slice(2));

// The interactive UI has exited (e.g. Ctrl+C unmounted the Ink app, which
// resolves cli.run). Tear down any session services and exit now. Otherwise the
// registered SIGINT/SIGTERM listeners keep the event loop alive, so the user
// would have to press Ctrl+C a second time to actually quit.
process.off("SIGINT", handleShutdown);
process.off("SIGTERM", handleShutdown);
await runSessionCleanupTasks();
process.exit(0);
