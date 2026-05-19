import type { TechBriefLocaleCatalog } from "../types.js";

export const esCatalog: TechBriefLocaleCatalog = {
  stageTitle: "Iniciando TechBrief",
  readyTitle: "TechBrief está en marcha",
  readyHint: "Abre las URL anteriores para usar el producto.",
  substageLabels: {
    "prepare-runtime": "Preparando el espacio de trabajo",
    "stop-old-services": "Deteniendo servicios anteriores",
    "start-api": "Iniciando el servidor API",
    "start-web": "Iniciando el servidor web",
    "sync-feed": "Sincronizando fuentes",
    "enrich-feed": "Procesando artículos",
    "article-processing": "Procesando artículos",
    "mobile-install": "Instalando app móvil",
    "open-browser": "Abriendo el navegador"
  },
  freshnessTitle: "Frescura del artículo (días)",
  freshnessHint: "Conserva solo los artículos más recientes que esta ventana.",
  freshnessLabels: { 1: "1 día", 3: "3 días", 5: "5 días", 7: "7 días" },
  freshnessRowLabel: "Frescura del artículo (días)",
  scheduleLabel: "Modo de programación",
  sourcesLabel: "Conjuntos de fuentes activos"
};
