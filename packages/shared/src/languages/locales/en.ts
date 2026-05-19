import type { TechBriefLocaleCatalog } from "../types.js";

export const enCatalog: TechBriefLocaleCatalog = {
  stageTitle: "Launching TechBrief",
  readyTitle: "TechBrief is running",
  readyHint: "Open the URLs above to use the product.",
  substageLabels: {
    "prepare-runtime": "Preparing runtime workspace",
    "stop-old-services": "Stopping previous services",
    "start-api": "Starting API server",
    "start-web": "Starting web server",
    "sync-feed": "Syncing sources",
    "enrich-feed": "Processing articles",
    "article-processing": "Processing articles",
    "mobile-install": "Installing mobile app",
    "open-browser": "Opening browser"
  },
  freshnessTitle: "Article freshness (days)",
  freshnessHint: "Only keep items newer than this window.",
  freshnessLabels: { 1: "1 day", 3: "3 days", 5: "5 days", 7: "7 days" },
  freshnessRowLabel: "Article freshness (days)",
  scheduleLabel: "Schedule mode",
  sourcesLabel: "Active source sets"
};
