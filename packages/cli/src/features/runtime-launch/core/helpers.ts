import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { detectWizardLocale, wizardMessage, type WizardLocale } from "../../../shared/i18n/wizard/index.js";
import type { LaunchInput } from "./types.js";

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function yieldToUi(): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}

export async function waitForUrl(url: string): Promise<boolean> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return true;
      }
    } catch {
      // Ignore transient startup failures.
    }

    await sleep(300);
  }

  return false;
}

export function launchLocale(input: LaunchInput): WizardLocale {
  return input.locale ?? detectWizardLocale();
}

export function appendDiagnostic(baseText: string, diagnostic?: string | null): string {
  return diagnostic ? `${baseText} ${diagnostic}` : baseText;
}

function stripTrailingDots(text: string): string {
  return text.replace(/\.*$/, "").trim();
}

export function syncProgressText(locale: WizardLocale, percent: number): string {
  return `${stripTrailingDots(wizardMessage(locale, "progressSyncFeed"))} ${percent}%...`;
}

export function syncSourceProgressText(locale: WizardLocale, sourceId: string, completed: number, total: number): string {
  return `${stripTrailingDots(wizardMessage(locale, "progressSyncFeed"))} ${sourceId} (${completed}/${total})`;
}

export function processArticlesProgressText(locale: WizardLocale, percent: number): string {
  void percent;
  return wizardMessage(locale, "progressProcessArticles");
}

export async function readLogSummary(logFile: string): Promise<string | null> {
  try {
    const content = await readFile(logFile, "utf8");
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return lines.find((line) => line.includes("EPERM") || line.includes("Error:") || line.includes("listen"))
      ?? lines.at(-1)
      ?? null;
  } catch {
    return null;
  }
}

export function resolveServeWebScriptPath(): string {
  const directCandidate = fileURLToPath(new URL("../bin/serve-web.js", import.meta.url));
  const bundledCandidate = fileURLToPath(new URL("./bin/serve-web.js", import.meta.url));
  const bundledCjsCandidate = fileURLToPath(new URL("./bin/serve-web.cjs", import.meta.url));
  const directCjsCandidate = fileURLToPath(new URL("../bin/serve-web.cjs", import.meta.url));
  const candidates = [directCandidate, bundledCandidate, bundledCjsCandidate, directCjsCandidate];

  return candidates.find((candidate) => existsSync(candidate)) ?? directCandidate;
}

export function resolveServeApiScriptPath(): string {
  const candidates = [
    // Bundled package: dist/bin/serve-api.js (server bundled at build time).
    fileURLToPath(new URL("./bin/serve-api.js", import.meta.url)),
    fileURLToPath(new URL("../bin/serve-api.js", import.meta.url)),
    // Local monorepo dev: the built server entry.
    fileURLToPath(new URL("../../../../../../apps/server/dist/index.js", import.meta.url))
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0]!;
}

export function resolveWebDistDir(): string {
  const candidates = [
    // Bundled package: dist/web (prebuilt client copied in at build time).
    fileURLToPath(new URL("./web", import.meta.url)),
    fileURLToPath(new URL("../web", import.meta.url)),
    // Local monorepo dev: the built web client.
    fileURLToPath(new URL("../../../../../../apps/web/dist", import.meta.url))
  ];
  return candidates.find((candidate) => existsSync(path.join(candidate, "index.html"))) ?? candidates[0]!;
}

export function resolveServeSchedulerScriptPath(): string {
  const directCandidate = fileURLToPath(new URL("../bin/serve-scheduler.js", import.meta.url));
  const bundledCandidate = fileURLToPath(new URL("./bin/serve-scheduler.js", import.meta.url));
  const bundledCjsCandidate = fileURLToPath(new URL("./bin/serve-scheduler.cjs", import.meta.url));
  const directCjsCandidate = fileURLToPath(new URL("../bin/serve-scheduler.cjs", import.meta.url));
  const candidates = [directCandidate, bundledCandidate, bundledCjsCandidate, directCjsCandidate];

  return candidates.find((candidate) => existsSync(candidate)) ?? directCandidate;
}
