import { chmodSync, cpSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(packageRoot, "../..");
const distDir = path.join(packageRoot, "dist");
const webDistDir = path.join(repoRoot, "apps/web/dist");

rmSync(distDir, { recursive: true, force: true });

// The published CLI serves a prebuilt web bundle and runs the API in-process —
// no source download or on-machine build. Make sure the web bundle exists, then
// copy it into the package so `files: ["dist"]` ships it.
function ensureWebBuilt() {
  if (existsSync(path.join(webDistDir, "index.html"))) {
    return;
  }
  for (const pkg of ["@techbrief/shared", "@techbrief/converter", "@techbrief/web"]) {
    execSync(`npm run build -w ${pkg}`, { cwd: repoRoot, stdio: "inherit" });
  }
}

ensureWebBuilt();

await build({
  alias: {
    "@techbrief/ai": path.resolve(packageRoot, "../ai/src/index.ts"),
    "@techbrief/converter": path.resolve(packageRoot, "../converter/src/index.ts"),
    "@techbrief/feed": path.resolve(packageRoot, "../feed/src/index.ts"),
    "@techbrief/feed-rules": path.resolve(packageRoot, "../feed-rules/src/index.ts"),
    "@techbrief/ingest": path.resolve(packageRoot, "../ingest/src/index.ts"),
    "@techbrief/pipeline": path.resolve(packageRoot, "../pipeline/src/index.ts"),
    "@techbrief/runtime": path.resolve(packageRoot, "../runtime/src/index.ts"),
    "@techbrief/scheduler": path.resolve(packageRoot, "../scheduler/src/index.ts"),
    "@techbrief/shared": path.resolve(packageRoot, "../shared/src/index.ts"),
    "react-devtools-core": path.resolve(packageRoot, "./src/shims/react-devtools-core.ts")
  },
  absWorkingDir: packageRoot,
  bundle: true,
  banner: {
    js: 'import { createRequire as __createRequire } from "node:module"; const require = __createRequire(import.meta.url);'
  },
  entryPoints: {
    index: "./src/index.ts",
    // The API server is bundled here (it self-starts on import, reading PORT/HOST
    // from env) so the standalone CLI runs it without a downloaded workspace.
    "bin/serve-api": path.resolve(repoRoot, "apps/server/src/index.ts"),
    "bin/serve-web": "./src/bin/serve-web.ts",
    "bin/serve-scheduler": "./src/bin/serve-scheduler.ts"
  },
  external: [
    "node:*",
    "better-sqlite3",
    "react",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
    "ink",
    "figlet"
  ],
  format: "esm",
  jsx: "automatic",
  outdir: distDir,
  platform: "node",
  sourcemap: false,
  target: "node20"
});

// Ship the prebuilt web client inside the package (served by dist/bin/serve-web.js).
cpSync(webDistDir, path.join(distDir, "web"), { recursive: true });

function normalizeEntry(entryPath) {
  const source = readFileSync(entryPath, "utf8");
  const normalized = source.startsWith("#!/usr/bin/env node\n")
    ? source
    : `#!/usr/bin/env node\n${source}`;
  writeFileSync(entryPath, normalized, "utf8");
  chmodSync(entryPath, 0o755);
}

normalizeEntry(path.join(distDir, "index.js"));
