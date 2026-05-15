import { access, cp, mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { x as extractTar } from "tar";

const DEFAULT_TEMPLATE_URL = process.env.TECHBRIEF_TEMPLATE_URL
  ?? "https://codeload.github.com/pubwave/techbrief/tar.gz/refs/heads/main";

function resolveLocalTemplateRoot(): string | null {
  const candidates = [
    fileURLToPath(new URL("../../../../", import.meta.url)),
    fileURLToPath(new URL("../../../", import.meta.url)),
    process.cwd()
  ];

  return candidates.find((candidate) =>
    existsSync(path.join(candidate, "apps/mobile/pubspec.yaml"))
    && existsSync(path.join(candidate, "apps/server/package.json"))
    && existsSync(path.join(candidate, "apps/web/package.json"))
  ) ?? null;
}

export interface StagedTemplate {
  templateUrl: string;
  tempRoot: string;
  workspaceDir: string;
  mobileDir: string;
  cleanup: () => Promise<void>;
}

export interface PreparedWorkspace {
  templateUrl: string;
  source: "local" | "download";
  workspaceDir: string;
  mobileDir: string;
  runtimeRoot: string;
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function isLocalTemplateWorkspace(workspaceDir: string): Promise<boolean> {
  const [hasMobile, hasServer, hasWeb] = await Promise.all([
    pathExists(path.join(workspaceDir, "apps/mobile/pubspec.yaml")),
    pathExists(path.join(workspaceDir, "apps/server/package.json")),
    pathExists(path.join(workspaceDir, "apps/web/package.json"))
  ]);

  return hasMobile && hasServer && hasWeb;
}

export async function stageTemplateArchive(templateUrl = DEFAULT_TEMPLATE_URL): Promise<StagedTemplate> {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "techbrief-template-"));
  const archivePath = path.join(tempRoot, "template.tar.gz");
  const workspaceDir = path.join(tempRoot, "workspace");

  const response = await fetch(templateUrl);
  if (!response.ok) {
    throw new Error(`Template download failed with status ${response.status}.`);
  }

  const archive = Buffer.from(await response.arrayBuffer());
  await writeFile(archivePath, archive);
  await mkdir(workspaceDir, { recursive: true });
  await extractTar({
    cwd: workspaceDir,
    file: archivePath,
    strip: 1
  });

  return {
    templateUrl,
    tempRoot,
    workspaceDir,
    mobileDir: path.join(workspaceDir, "apps/mobile"),
    cleanup: async () => {
      await rm(tempRoot, { recursive: true, force: true });
    }
  };
}

export async function prepareRuntimeWorkspace(
  runtimeRoot: string,
  templateUrl = DEFAULT_TEMPLATE_URL
): Promise<PreparedWorkspace> {
  const localTemplateRoot = resolveLocalTemplateRoot();

  if (localTemplateRoot && await isLocalTemplateWorkspace(localTemplateRoot)) {
    return {
      templateUrl,
      source: "local",
      runtimeRoot,
      workspaceDir: localTemplateRoot,
      mobileDir: path.join(localTemplateRoot, "apps/mobile")
    };
  }

  const workspaceDir = path.join(runtimeRoot, "workspace");
  await rm(workspaceDir, { recursive: true, force: true });
  await mkdir(runtimeRoot, { recursive: true });

  const staged = await stageTemplateArchive(templateUrl);
  try {
    await cp(staged.workspaceDir, workspaceDir, { recursive: true });
  } finally {
    await staged.cleanup();
  }

  return {
    templateUrl,
    source: "download",
    runtimeRoot,
    workspaceDir,
    mobileDir: path.join(workspaceDir, "apps/mobile")
  };
}
