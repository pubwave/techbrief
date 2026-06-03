import type { TechBriefLocaleCatalog } from "../types.js";

export const ptCatalog: TechBriefLocaleCatalog = {
  stageTitle: "Iniciando o TechBrief",
  readyTitle: "TechBrief está em execução",
  readyHint: "Abra os URLs acima para usar o produto.",
  launchFailedLabel: "Falha ao iniciar",
  serviceFailedLabel: "Falha no serviço",
  serviceStartFailedLabel: "Falha ao iniciar o serviço",
  runtimeLabel: "Diretório de execução",
  noneLabel: "nenhum",
  substageLabels: {
    "prepare-runtime": "Preparando o espaço de trabalho",
    "stop-old-services": "Parando serviços anteriores",
    "start-api": "Iniciando o servidor API",
    "start-web": "Iniciando o servidor web",
    "sync-feed": "Sincronizando fontes",
    "enrich-feed": "Processando artigos",
    "article-processing": "Processando artigos",
    "mobile-install": "Instalando app móvel",
    "open-browser": "Abrindo o navegador"
  },
  freshnessTitle: "Frescor do artigo (dias)",
  freshnessHint: "Mantenha apenas itens mais novos que esta janela.",
  freshnessLabels: { 1: "1 dia", 3: "3 dias", 5: "5 dias", 7: "7 dias" },
  freshnessRowLabel: "Frescor do artigo (dias)",
  scheduleLabel: "Modo de agendamento",
  sourcesLabel: "Conjuntos de fontes ativos"
};
