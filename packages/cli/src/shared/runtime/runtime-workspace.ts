import path from "node:path";
import { access, mkdir } from "node:fs/promises";
import { formatCommand, runCommand, runCommandAsync } from "../paths/workspace.js";
import { runtimeRoot as resolveCliRuntimeRoot } from "../paths/runtime-paths.js";
import { prepareRuntimeWorkspace } from "./template.js";

export interface RuntimeWorkspaceResult {
  ok: boolean;
  runtimeRoot: string;
  workspaceDir: string;
  templateSource: "local" | "download";
  steps: Array<{ label: string; ok: boolean; detail: string }>;
}

export type RuntimeWorkspaceProgressStage = "prepare-template" | "install-deps" | "build-workspace";

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function ensureRuntimeWorkspace(input?: {
  templateUrl?: string;
  runtimeRoot?: string;
  onProgress?: (stage: RuntimeWorkspaceProgressStage) => void;
}): Promise<RuntimeWorkspaceResult> {
  const runtimeRoot = input?.runtimeRoot ?? resolveCliRuntimeRoot();
  await mkdir(runtimeRoot, { recursive: true });

  input?.onProgress?.("prepare-template");
  const prepared = await prepareRuntimeWorkspace(runtimeRoot, input?.templateUrl);
  const steps: RuntimeWorkspaceResult["steps"] = [
    {
      label: "template",
      ok: true,
      detail: prepared.source === "local"
        ? `Using local workspace at ${prepared.workspaceDir}`
        : `Downloaded template into ${prepared.workspaceDir}`
    }
  ];

  if (!(await pathExists(path.join(prepared.workspaceDir, "node_modules")))) {
    input?.onProgress?.("install-deps");
    const install = await runCommandAsync("npm", ["install"], prepared.workspaceDir);
    steps.push({
      label: formatCommand("npm", ["install"]),
      ok: install.ok,
      detail: install.ok ? "Dependencies installed." : (install.stderr || "npm install failed.")
    });

    if (!install.ok) {
      return {
        ok: false,
        runtimeRoot,
        workspaceDir: prepared.workspaceDir,
        templateSource: prepared.source,
        steps
      };
    }
  } else {
    steps.push({
      label: "npm install",
      ok: true,
      detail: "Existing node_modules detected. Skipped reinstall."
    });
  }

  const serverBuilt = await pathExists(path.join(prepared.workspaceDir, "apps/server/dist/index.js"));
  const webBuilt = await pathExists(path.join(prepared.workspaceDir, "apps/web/dist/index.html"));

  if (!serverBuilt || !webBuilt) {
    input?.onProgress?.("build-workspace");
    const build = await runCommandAsync("npm", ["run", "build"], prepared.workspaceDir);
    steps.push({
      label: "npm run build",
      ok: build.ok,
      detail: build.ok ? "Server and web assets built." : (build.stderr || "npm run build failed.")
    });

    if (!build.ok) {
      return {
        ok: false,
        runtimeRoot,
        workspaceDir: prepared.workspaceDir,
        templateSource: prepared.source,
        steps
      };
    }
  } else {
    steps.push({
      label: "npm run build",
      ok: true,
      detail: "Existing build artifacts detected. Skipped rebuild."
    });
  }

  return {
    ok: true,
    runtimeRoot,
    workspaceDir: prepared.workspaceDir,
    templateSource: prepared.source,
    steps
  };
}
