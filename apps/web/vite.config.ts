import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "chart.js/auto": path.resolve(__dirname, "node_modules/chart.js/auto/auto.js")
    }
  },
  optimizeDeps: {
    include: ["chart.js/auto"]
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@tiptap") || id.includes("prosemirror")) {
            return "pubwave-editor-core";
          }

          if (id.includes("@pubwave/editor")) {
            return "pubwave-editor";
          }

          if (id.includes("chart.js")) {
            return "chart-vendor";
          }

          if (id.includes("react") || id.includes("scheduler")) {
            return "react-vendor";
          }

          return undefined;
        }
      }
    }
  },
  server: {
    port: 4173,
    proxy: {
      "/v1": "http://127.0.0.1:4310",
      "/health": "http://127.0.0.1:4310"
    }
  }
});
