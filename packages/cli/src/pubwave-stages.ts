import os from "node:os";
import type { SetupStage, StageResult, StageRunContext } from "@pubwave/cli";
import type { AppConfig } from "@techbrief/shared";
import { TECHBRIEF_LOCALE_CATALOGS } from "@techbrief/shared";
import { prepareLaunchTechBrief, type LaunchHandle, type LaunchInput } from "./features/runtime-launch/index.js";
import { openBrowser } from "./shared/browser/browser.js";

function resolveLanIp(): string | undefined {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const addr of iface ?? []) {
      if (addr.family === "IPv4" && !addr.internal) {
        return addr.address;
      }
    }
  }
  return undefined;
}

function getCatalog(locale: string) {
  return TECHBRIEF_LOCALE_CATALOGS[locale as keyof typeof TECHBRIEF_LOCALE_CATALOGS]
    ?? TECHBRIEF_LOCALE_CATALOGS.en;
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
    const catalog = getCatalog(ctx.locale);

    const progressHandle = ctx.progress.beginIndeterminate(catalog.stageTitle, "cyanBright");

    const lanIp = resolveLanIp();
    const launchInput: LaunchInput = {
      locale: ctx.locale,
      noOpen: true,
      session: sessionMode,
      ...(lanIp ? { host: lanIp } : {}),
      ...(projectConfig.ai?.modelSource === "local" ? { localModelRuntime: "ollama" } : {}),
      ...(projectConfig.server?.apiPort ? { apiPort: projectConfig.server.apiPort } : {}),
      ...(projectConfig.server?.webPort ? { webPort: projectConfig.server.webPort } : {}),
      onProgress: (stage) => {
        const label = catalog.substageLabels[stage] ?? stage;
        ctx.progress.setStageTitle(label);
        ctx.progress.appendProgress(label);
      },
      onProgressText: (text) => {
        ctx.progress.updateLastProgress(text);
      },
      onArticleProcessingProgress: (progress) => {
        const label = catalog.substageLabels["article-processing"] ?? catalog.stageTitle;
        ctx.progress.updateLastProgress(
          `${label} [${progress.processed}/${progress.total}] saved=${progress.saved}`
        );
      }
    };

    try {
      const launchHandle = await prepareLaunchTechBrief(launchInput);

      if (!launchHandle.ok) {
        const detail = launchHandle.sync.detail ?? catalog.launchFailedLabel;
        progressHandle.fail(`${catalog.launchFailedLabel}: ${detail}`, detail);
        return { status: "failed", detail };
      }

      progressHandle.complete(catalog.stageTitle, "green");
      pendingLaunchHandle = launchHandle;

      return { status: "ok" };
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      progressHandle.fail(catalog.launchFailedLabel, detail);
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
        progressHandle.fail(`${catalog.serviceFailedLabel}: ${failedCoreStep.detail}`, failedCoreStep.detail);
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
          { label: catalog.runtimeLabel, value: result.runtimeRoot }
        ],
        hint: catalog.readyHint
      });

      openBrowser(result.webUrl);

      return { status: "ok" };
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      progressHandle.fail(catalog.serviceStartFailedLabel, detail);
      return { status: "failed", detail };
    }
  }
};

export const techbriefStages = [techbriefLaunchStage, techbriefOpenStage];

export function getPendingApiUrl(): string | undefined {
  return pendingLaunchHandle?.apiUrl;
}
