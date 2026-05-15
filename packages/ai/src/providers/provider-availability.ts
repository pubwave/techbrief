import type { AiConfig } from "@techbrief/shared";
import type { ProviderAvailability } from "../types.js";
import { inspectCloudProviderAvailability } from "./cloud-runtime-health.js";
import { inspectLocalProviderAvailability } from "./local-runtime-health.js";

export async function listAiProviderAvailability(config: AiConfig): Promise<ProviderAvailability[]> {
  const cloudAvailability = await inspectCloudProviderAvailability(config);

  return [
    ...cloudAvailability,
    await inspectLocalProviderAvailability(config.model)
  ];
}
