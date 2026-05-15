import { chmodSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const distDir = path.join(packageRoot, "dist");

rmSync(distDir, { recursive: true, force: true });

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
    "react": path.resolve(packageRoot, "./node_modules/react/index.js"),
    "react/jsx-runtime": path.resolve(packageRoot, "./node_modules/react/jsx-runtime.js"),
    "react/jsx-dev-runtime": path.resolve(packageRoot, "./node_modules/react/jsx-dev-runtime.js"),
    "react-devtools-core": path.resolve(packageRoot, "./src/shims/react-devtools-core.ts")
  },
  absWorkingDir: packageRoot,
  bundle: true,
  banner: {
    js: 'import { createRequire as __createRequire } from "node:module"; const require = __createRequire(import.meta.url);'
  },
  entryPoints: {
    index: "./src/index.ts",
    "bin/serve-web": "./src/bin/serve-web.ts",
    "bin/serve-scheduler": "./src/bin/serve-scheduler.ts"
  },
  external: [
    "node:*",
    "better-sqlite3"
  ],
  format: "esm",
  jsx: "automatic",
  outdir: distDir,
  platform: "node",
  sourcemap: true,
  target: "node20"
});

const cliEntrypoint = path.join(distDir, "index.js");
const cliSource = readFileSync(cliEntrypoint, "utf8");
const normalizedCliSource = cliSource.startsWith("#!/usr/bin/env node\n")
  ? cliSource
  : `#!/usr/bin/env node\n${cliSource}`;
writeFileSync(cliEntrypoint, normalizedCliSource, "utf8");
chmodSync(cliEntrypoint, 0o755);
