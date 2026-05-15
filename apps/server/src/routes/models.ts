import { listAiProviderAvailability } from "@techbrief/ai";
import { loadConfig } from "@techbrief/runtime";
import type { RequestContext } from "../http.js";
import { sendJson } from "../http.js";

export async function handleModelsRoute({ response }: RequestContext): Promise<void> {
  const config = await loadConfig();
  sendJson(response, 200, {
    modelSource: config.ai.modelSource,
    provider: config.ai.provider,
    model: config.ai.model,
    availability: await listAiProviderAvailability(config.ai)
  });
}
