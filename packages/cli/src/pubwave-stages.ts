import type { SetupStage, StageResult, StageRunContext } from "@pubwave/cli";
import type { AppConfig } from "@techbrief/shared";
import { TECHBRIEF_LOCALE_CATALOGS } from "@techbrief/shared";
import { prepareLaunchTechBrief, type LaunchHandle, type LaunchInput } from "./features/runtime-launch/index.js";
import { openBrowser } from "./shared/browser/browser.js";

function getCatalog(locale: string) {
  return TECHBRIEF_LOCALE_CATALOGS[locale as keyof typeof TECHBRIEF_LOCALE_CATALOGS]
    ?? TECHBRIEF_LOCALE_CATALOGS.en;
}

function defaultMobilePlatform(config: AppConfig): "ios" | "android" | undefined {
  if (config.mobile.ios.enabled) return "ios";
  if (config.mobile.android.enabled) return "android";
  return undefined;
}

const sessionMode = process.argv.includes("--session") || process.argv.includes("-session");

let pendingLaunchHandle: LaunchHandle | null = null;

export const techbriefLaunchStage: SetupStage<AppConfig> = {
  id: "techbrief-launch",
  insertAfter: "save-config",
  title: ({ locale }) => getCatalog(locale).stageTitle,
  async run(ctx: StageRunContext<AppConfig>): Promise<StageResult> {
    pendingLaunchHandle = null;
    const projectConfig = ctx.projectConfig;
    const platform = defaultMobilePlatform(projectConfig);
    const catalog = getCatalog(ctx.locale);

    const progressHandle = ctx.progress.beginIndeterminate(catalog.stageTitle, "cyanBright");

    const launchInput: LaunchInput = {
      locale: ctx.locale,
      noOpen: true,
      noMobile: true,
      session: sessionMode,
      ...(projectConfig.server?.apiPort ? { apiPort: projectConfig.server.apiPort } : {}),
      ...(projectConfig.server?.webPort ? { webPort: projectConfig.server.webPort } : {}),
      ...(platform ? { mobilePlatform: platform } : {}),
      onProgress: (stage) => {
        const label = catalog.substageLabels[stage] ?? stage;
        ctx.progress.setStageTitle(label);
        ctx.progress.appendProgress(label);
      },
      onProgressText: (text) => {
        ctx.progress.updateLastProgress(text);
      },
      onArticleProcessingProgress: (progress) => {
        const label = catalog.substageLabels["article-processing"] ?? "Processing articles";
        ctx.progress.updateLastProgress(
          `${label} [${progress.processed}/${progress.total}] saved=${progress.saved}`
        );
      }
    };

    try {
      const launchHandle = await prepareLaunchTechBrief(launchInput);

      if (!launchHandle.ok) {
        const detail = launchHandle.sync.detail ?? "Sync failed";
        progressHandle.fail(`Launch failed: ${detail}`, detail);
        return { status: "failed", detail };
      }

      progressHandle.complete(catalog.stageTitle, "green");
      pendingLaunchHandle = launchHandle;

      return { status: "ok" };
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      progressHandle.fail("Launch failed", detail);
      return { status: "failed", detail };
    }
  }
};

export const techbriefOpenStage: SetupStage<AppConfig> = {
  id: "techbrief-open",
  insertAfter: "mobile-install",
  title: ({ locale }) => getCatalog(locale).readyTitle,
  skip: () => pendingLaunchHandle === null,
  async run(ctx: StageRunContext<AppConfig>): Promise<StageResult> {
    const launchHandle = pendingLaunchHandle!;
    const catalog = getCatalog(ctx.locale);

    const progressHandle = ctx.progress.beginIndeterminate(catalog.readyTitle, "cyanBright");

    try {
      const result = await launchHandle.startServices();

      const coreLabels = new Set(["sync", "api", "api:health", "scheduler", "web", "web:health"]);
      const failedCoreStep = result.steps.find((step) => !step.ok && coreLabels.has(step.label));
      if (failedCoreStep) {
        progressHandle.fail(`Service failed: ${failedCoreStep.detail}`, failedCoreStep.detail);
        return { status: "failed", detail: failedCoreStep.detail };
      }

      progressHandle.complete(catalog.readyTitle, "green");

      ctx.progress.appendStatusCard({
        id: "techbrief-ready",
        title: catalog.readyTitle,
        color: "green",
        rows: [
          { label: "API", value: result.apiUrl },
          { label: "Web", value: result.webUrl },
          { label: "Runtime", value: result.runtimeRoot }
        ],
        hint: catalog.readyHint
      });

      openBrowser(result.webUrl);

      return { status: "ok" };
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      progressHandle.fail("Service start failed", detail);
      return { status: "failed", detail };
    }
  }
};

export const techbriefStages = [techbriefLaunchStage, techbriefOpenStage];
