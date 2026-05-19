import type { TechBriefLocaleCatalog } from "../types.js";

export const deCatalog: TechBriefLocaleCatalog = {
  stageTitle: "TechBrief wird gestartet",
  readyTitle: "TechBrief läuft",
  readyHint: "Öffne die URLs oben, um das Produkt zu nutzen.",
  substageLabels: {
    "prepare-runtime": "Arbeitsbereich wird vorbereitet",
    "stop-old-services": "Vorherige Dienste werden gestoppt",
    "start-api": "API-Server wird gestartet",
    "start-web": "Webserver wird gestartet",
    "sync-feed": "Quellen synchronisieren",
    "enrich-feed": "Artikel werden verarbeitet",
    "article-processing": "Artikel werden verarbeitet",
    "mobile-install": "Mobile App installieren",
    "open-browser": "Browser öffnen"
  },
  freshnessTitle: "Artikelfrische (Tage)",
  freshnessHint: "Nur Elemente neuer als dieses Fenster behalten.",
  freshnessLabels: { 1: "1 Tag", 3: "3 Tage", 5: "5 Tage", 7: "7 Tage" },
  freshnessRowLabel: "Artikelfrische (Tage)",
  scheduleLabel: "Planungsmodus",
  sourcesLabel: "Aktive Quellengruppen"
};
