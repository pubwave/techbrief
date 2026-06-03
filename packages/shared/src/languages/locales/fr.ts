import type { TechBriefLocaleCatalog } from "../types.js";

export const frCatalog: TechBriefLocaleCatalog = {
  stageTitle: "Démarrage de TechBrief",
  readyTitle: "TechBrief est en cours",
  readyHint: "Ouvrez les URL ci-dessus pour utiliser le produit.",
  launchFailedLabel: "Échec du lancement",
  serviceFailedLabel: "Échec du service",
  serviceStartFailedLabel: "Échec du démarrage du service",
  runtimeLabel: "Répertoire d'exécution",
  noneLabel: "aucun",
  substageLabels: {
    "prepare-runtime": "Préparation de l'espace de travail",
    "stop-old-services": "Arrêt des services précédents",
    "start-api": "Démarrage du serveur API",
    "start-web": "Démarrage du serveur web",
    "sync-feed": "Synchronisation des sources",
    "enrich-feed": "Traitement des articles",
    "article-processing": "Traitement des articles",
    "mobile-install": "Installation de l'app mobile",
    "open-browser": "Ouverture du navigateur"
  },
  freshnessTitle: "Fraîcheur des articles (jours)",
  freshnessHint: "Ne garder que les éléments plus récents que cette fenêtre.",
  freshnessLabels: { 1: "1 jour", 3: "3 jours", 5: "5 jours", 7: "7 jours" },
  freshnessRowLabel: "Fraîcheur des articles (jours)",
  scheduleLabel: "Mode de planification",
  sourcesLabel: "Ensembles de sources actifs"
};
