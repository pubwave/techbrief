import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Resolve @techbrief/* to each package's source entry so unit tests run against
// the live TypeScript, not a (possibly stale) dist build. Vite resolves the
// NodeNext ".js" import specifiers to their ".ts" sources automatically.
const techbriefAlias = {
  find: /^@techbrief\/([^/]+)$/,
  replacement: fileURLToPath(new URL("./packages/$1/src/index.ts", import.meta.url))
};

export default defineConfig({
  resolve: {
    alias: [techbriefAlias]
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"]
  }
});
