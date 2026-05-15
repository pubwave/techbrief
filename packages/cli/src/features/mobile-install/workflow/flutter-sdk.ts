import { existsSync } from "node:fs";
import { mkdir, mkdtemp, open, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { runtimeRoot } from "../../../shared/paths/runtime-paths.js";
import { detectWizardLocale, wizardMessage, type WizardLocale } from "../../../shared/i18n/wizard/index.js";
import { runCommand } from "../../../shared/paths/workspace.js";

const FLUTTER_RELEASES_BASE_URL = "https://storage.googleapis.com/flutter_infra_release/releases";
const TECHBRIEF_FLUTTER_VERSION = "3.38.5";

interface FlutterReleaseManifest {
  base_url: string;
  current_release: Record<string, string>;
  releases: Array<{
    hash: string;
    channel: string;
    version: string;
    archive: string;
  }>;
}

interface FlutterToolResult {
  ok: boolean;
  command: string;
  detail: string;
  source: "system" | "managed";
}

export type FlutterInstallStage = "download" | "extract" | "ready";
export interface FlutterProgressEvent {
  stage: FlutterInstallStage;
  receivedBytes?: number;
  totalBytes?: number;
}

type FlutterProgressCallback = (event: FlutterProgressEvent) => void | Promise<void>;

function managedFlutterRoot(): string {
  return path.join(runtimeRoot(), "flutter-sdk");
}

function flutterDownloadsRoot(): string {
  return path.join(runtimeRoot(), "downloads");
}

function managedFlutterCommand(): string {
  return path.join(
    managedFlutterRoot(),
    "bin",
    os.platform() === "win32" ? "flutter.bat" : "flutter"
  );
}

function firstOutputLine(output: string, fallback: string): string {
  return output
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean) ?? fallback;
}

function resolveManagedFlutter(locale: WizardLocale): FlutterToolResult | null {
  const command = managedFlutterCommand();
  if (!existsSync(command)) {
    return null;
  }

  const flutterCheck = runCommand(command, ["--version"]);
  if (!flutterCheck.ok) {
    return null;
  }

  return {
    ok: true,
    command,
    detail: firstOutputLine(flutterCheck.stdout || flutterCheck.stderr, wizardMessage(locale, "mobileCheckReady")),
    source: "managed"
  };
}

function flutterManifestUrl(): string | null {
  switch (os.platform()) {
    case "darwin":
      return `${FLUTTER_RELEASES_BASE_URL}/releases_macos.json`;
    case "linux":
      return `${FLUTTER_RELEASES_BASE_URL}/releases_linux.json`;
    case "win32":
      return `${FLUTTER_RELEASES_BASE_URL}/releases_windows.json`;
    default:
      return null;
  }
}

async function fetchPinnedArchiveUrl(): Promise<string> {
  const manifestUrl = flutterManifestUrl();
  if (!manifestUrl) {
    throw new Error("Current platform is not supported for automatic Flutter install.");
  }

  const response = await fetch(manifestUrl);
  if (!response.ok) {
    throw new Error(`Could not load Flutter release manifest (${response.status}).`);
  }

  const manifest = await response.json() as FlutterReleaseManifest;
  const pinnedRelease = manifest.releases.find((release) =>
    release.channel === "stable" && release.version === TECHBRIEF_FLUTTER_VERSION
  );

  if (!pinnedRelease) {
    throw new Error(`Could not find Flutter ${TECHBRIEF_FLUTTER_VERSION} in the official release archive.`);
  }

  return `${manifest.base_url}/${pinnedRelease.archive}`;
}

function archiveFileNameFromUrl(archiveUrl: string): string {
  return archiveUrl.split("/").at(-1) ?? `flutter-${TECHBRIEF_FLUTTER_VERSION}.zip`;
}

async function fileSize(filePath: string): Promise<number> {
  try {
    return (await stat(filePath)).size;
  } catch {
    return 0;
  }
}

function totalBytesFromResponse(response: Response, fallbackBytes = 0): number | undefined {
  const contentRange = response.headers.get("content-range");
  if (contentRange) {
    const totalMatch = contentRange.match(/\/(\d+)$/);
    const totalValue = totalMatch?.[1];
    if (totalValue) {
      return Number.parseInt(totalValue, 10);
    }
  }

  const contentLength = response.headers.get("content-length");
  if (!contentLength) {
    return undefined;
  }

  const parsedLength = Number.parseInt(contentLength, 10);
  if (!Number.isFinite(parsedLength)) {
    return undefined;
  }

  return response.status === 206 ? fallbackBytes + parsedLength : parsedLength;
}

async function downloadArchive(
  archiveUrl: string,
  targetFile: string,
  onProgress?: FlutterProgressCallback
): Promise<void> {
  await mkdir(path.dirname(targetFile), { recursive: true });
  const existingBytes = await fileSize(targetFile);
  const response = await fetch(
    archiveUrl,
    existingBytes > 0
      ? { headers: { Range: `bytes=${existingBytes}-` } }
      : {}
  );

  if (response.status === 416) {
    const totalBytes = totalBytesFromResponse(response);
    if (typeof totalBytes === "number" && totalBytes === existingBytes) {
      await onProgress?.({
        stage: "download",
        receivedBytes: totalBytes,
        totalBytes
      });
      return;
    }

    await rm(targetFile, { force: true });
    return await downloadArchive(archiveUrl, targetFile, onProgress);
  }

  if (!response.ok) {
    throw new Error(`Flutter download failed with status ${response.status}.`);
  }

  const appendMode = existingBytes > 0 && response.status === 206;
  const resumedBytes = appendMode ? existingBytes : 0;
  const totalBytes = totalBytesFromResponse(response, resumedBytes);

  if (existingBytes > 0 && !appendMode) {
    await rm(targetFile, { force: true });
  }

  if (!response.body) {
    const archive = Buffer.from(await response.arrayBuffer());
    await writeFile(targetFile, archive);
    await onProgress?.({
      stage: "download",
      receivedBytes: resumedBytes + archive.length,
      totalBytes: totalBytes ?? (resumedBytes + archive.length)
    });
    return;
  }

  const reader = response.body.getReader();
  const fileHandle = await open(targetFile, appendMode ? "a" : "w");
  let receivedBytes = resumedBytes;
  let lastReportedPercent = -1;

  try {
    if (resumedBytes > 0) {
      await onProgress?.({
        stage: "download",
        receivedBytes: resumedBytes,
        ...(typeof totalBytes === "number" ? { totalBytes } : {})
      });
    }

    while (true) {
      const chunk = await reader.read();
      if (chunk.done) {
        break;
      }

      await fileHandle.write(chunk.value);
      receivedBytes += chunk.value.length;

      const nextPercent = totalBytes && totalBytes > 0
        ? Math.min(100, Math.floor((receivedBytes / totalBytes) * 100))
        : undefined;
      const shouldReport = nextPercent === undefined
        || nextPercent !== lastReportedPercent;

      if (shouldReport) {
        lastReportedPercent = nextPercent ?? lastReportedPercent;
        await onProgress?.({
          stage: "download",
          receivedBytes,
          ...(typeof totalBytes === "number" ? { totalBytes } : {})
        });
      }
    }
  } finally {
    await fileHandle.close();
  }

  if (typeof totalBytes === "number" && receivedBytes !== totalBytes) {
    throw new Error(`Flutter download is incomplete (${receivedBytes}/${totalBytes} bytes).`);
  }
}

async function extractArchive(archivePath: string, extractDir: string): Promise<void> {
  const platform = os.platform();

  if (platform === "darwin") {
    const extractResult = runCommand("ditto", ["-x", "-k", archivePath, extractDir]);
    if (!extractResult.ok) {
      throw new Error(extractResult.stderr || extractResult.stdout || "Could not extract Flutter archive.");
    }
    return;
  }

  if (platform === "linux") {
    const extractResult = runCommand("tar", ["-xf", archivePath, "-C", extractDir]);
    if (!extractResult.ok) {
      throw new Error(extractResult.stderr || extractResult.stdout || "Could not extract Flutter archive.");
    }
    return;
  }

  if (platform === "win32") {
    const extractResult = runCommand("powershell", [
      "-NoProfile",
      "-Command",
      `Expand-Archive -LiteralPath '${archivePath}' -DestinationPath '${extractDir}' -Force`
    ]);
    if (!extractResult.ok) {
      throw new Error(extractResult.stderr || extractResult.stdout || "Could not extract Flutter archive.");
    }
    return;
  }

  throw new Error("Current platform is not supported for automatic Flutter install.");
}

async function installManagedFlutter(onProgress?: FlutterProgressCallback): Promise<void> {
  const installRoot = managedFlutterRoot();
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "techbrief-flutter-"));
  const archiveUrl = await fetchPinnedArchiveUrl();
  const archivePath = path.join(flutterDownloadsRoot(), archiveFileNameFromUrl(archiveUrl));
  const extractDir = path.join(tempRoot, "extract");
  const extractedFlutterDir = path.join(extractDir, "flutter");

  try {
    await mkdir(runtimeRoot(), { recursive: true });
    await mkdir(flutterDownloadsRoot(), { recursive: true });
    await mkdir(extractDir, { recursive: true });
    await rm(installRoot, { recursive: true, force: true });

    await onProgress?.({ stage: "download", receivedBytes: 0 });
    await downloadArchive(archiveUrl, archivePath, onProgress);
    await onProgress?.({ stage: "extract" });
    await extractArchive(archivePath, extractDir);

    if (!existsSync(extractedFlutterDir)) {
      throw new Error("Flutter archive extracted, but SDK folder was not found.");
    }

    await rename(extractedFlutterDir, installRoot);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

async function hydrateManagedFlutterCache(command: string): Promise<void> {
  const versionResult = runCommand(command, ["--version"]);
  if (!versionResult.ok) {
    throw new Error(versionResult.stderr || versionResult.stdout || "Flutter setup check failed.");
  }
}

export async function ensureFlutterTool(localeInput?: WizardLocale): Promise<FlutterToolResult> {
  return await ensureFlutterToolWithProgress(localeInput);
}

export async function ensureFlutterToolWithProgress(
  localeInput?: WizardLocale,
  onProgress?: FlutterProgressCallback
): Promise<FlutterToolResult> {
  const locale = localeInput ?? detectWizardLocale();
  const managedFlutter = resolveManagedFlutter(locale);
  if (managedFlutter) {
    await onProgress?.({ stage: "ready" });
    return managedFlutter;
  }

  try {
    await installManagedFlutter(onProgress);
    await hydrateManagedFlutterCache(managedFlutterCommand());
  } catch (error) {
    return {
      ok: false,
      command: managedFlutterCommand(),
      detail: error instanceof Error
        ? `${wizardMessage(locale, "mobileCheckFlutterInstallFailed")} ${error.message}`.trim()
        : wizardMessage(locale, "mobileCheckFlutterInstallFailed"),
      source: "managed"
    };
  }

  const installedFlutter = resolveManagedFlutter(locale);
  if (!installedFlutter) {
    return {
      ok: false,
      command: managedFlutterCommand(),
      detail: wizardMessage(locale, "mobileCheckFlutterInstallFailed"),
      source: "managed"
    };
  }

  await onProgress?.({ stage: "ready" });
  return {
    ...installedFlutter,
    detail: `${wizardMessage(locale, "mobileCheckFlutterInstalled")} ${installedFlutter.detail}`.trim()
  };
}

export async function readManagedFlutterVersion(): Promise<string | null> {
  const command = managedFlutterCommand();
  if (!existsSync(command)) {
    return null;
  }

  const versionResult = await readFile(path.join(managedFlutterRoot(), "version"), "utf8").catch(() => null);
  return versionResult?.trim() ?? null;
}
