import type { CloudCatalogModelChoice } from "./cloud-shared.js";
import { alibabaCatalog } from "./alibaba.js";
import { anthropicCatalog } from "./anthropic.js";
import { byteDanceCatalog } from "./bytedance.js";
import { deepSeekCatalog } from "./deepseek.js";
import { googleCatalog } from "./google.js";
import { metaCatalog } from "./meta.js";
import { miniMaxCatalog } from "./minimax.js";
import { mistralCatalog } from "./mistral.js";
import { moonshotCatalog } from "./moonshot.js";
import { openAiCatalog } from "./openai.js";
import { openRouterCatalog } from "./openrouter.js";
import { xAiCatalog } from "./xai.js";
import { zhipuCatalog } from "./zhipu.js";

const CLOUD_PROVIDER_CATALOG = [
  openAiCatalog,
  anthropicCatalog,
  googleCatalog,
  metaCatalog,
  xAiCatalog,
  mistralCatalog,
  alibabaCatalog,
  byteDanceCatalog,
  deepSeekCatalog,
  zhipuCatalog,
  miniMaxCatalog,
  moonshotCatalog,
  openRouterCatalog
];

export function cloudProviderCatalog(): CloudCatalogModelChoice[] {
  return CLOUD_PROVIDER_CATALOG.map(({ models: _models, ...provider }) => provider);
}

export function cloudModelCatalog(provider: string): CloudCatalogModelChoice[] {
  return CLOUD_PROVIDER_CATALOG.find((entry) => entry.value === provider)?.models ?? openAiCatalog.models;
}
