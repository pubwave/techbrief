import { chmodSync, readFileSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { context } from "esbuild";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const distDir = path.join(packageRoot, "dist");
const entryFile = path.join(distDir, "index.js");

const forwardedArgs = process.argv.slice(2);
let child = null;

function restart() {
  if (child) {
    // Mark this kill as a rebuild restart so its exit doesn't tear down the watcher.
    child.killedForRestart = true;
    child.kill();
    child = null;
    // Clear terminal so the new Ink render starts from a clean screen.
    process.stdout.write("\x1B[2J\x1B[3J\x1B[H");
  }
  const current = spawn(process.execPath, [entryFile, ...forwardedArgs], { stdio: "inherit" });
  child = current;
  current.on("exit", (code) => {
    if (child === current) child = null;
    if (current.killedForRestart) {
      // We killed it to load a rebuild; keep watching for the next change.
      return;
    }
    if (code !== null && code !== 0 && code !== 130) {
      // Crash: keep watching so fixing the code triggers a rebuild + restart.
      console.error(`[dev] process exited with code ${code}`);
      return;
    }
    // Clean quit (e.g. user pressed Ctrl+C, which the CLI handled and exited 0):
    // stop the esbuild watcher and exit too, so a second Ctrl+C isn't needed
    // just to kill this dev wrapper.
    void ctx.dispose().finally(() => process.exit(0));
  });
}

function normalizeEntry(entryPath) {
  const source = readFileSync(entryPath, "utf8");
  const normalized = source.startsWith("#!/usr/bin/env node\n")
    ? source
    : `#!/usr/bin/env node\n${source}`;
  writeFileSync(entryPath, normalized, "utf8");
  chmodSync(entryPath, 0o755);
}

const ctx = await context({
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
  entryPoints: { index: "./src/index.ts" },
  external: [
    "node:*",
    "better-sqlite3",
    "react",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
    "react-dom",
    "ink",
    "figlet"
  ],
  format: "esm",
  jsx: "automatic",
  outdir: distDir,
  platform: "node",
  sourcemap: true,
  target: "node20",
  plugins: [
    {
      name: "restart-on-build",
      setup(build) {
        build.onEnd((result) => {
          if (result.errors.length > 0) return;
          normalizeEntry(entryFile);
          console.log("[dev] rebuilt, restarting...");
          restart();
        });
      }
    }
  ]
});

await ctx.watch();
console.log("[dev] watching for changes...");
restart();

process.on("SIGINT", () => {
  if (child) child.kill();
  ctx.dispose();
  process.exit(0);
});
