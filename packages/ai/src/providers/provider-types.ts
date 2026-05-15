import type { AiConfig } from "@techbrief/shared";
import type { HttpProviderOptions, ProviderAvailability } from "../types.js";

export interface ProviderDefinition {
  provider: string;
  baseUrl: string;
  availabilityDetail: string;
}

export interface ProviderAvailabilityDefinition extends ProviderAvailability {
  provider: string;
}

export interface OpenAiCompatibleProviderResolver {
  resolve(config: AiConfig): HttpProviderOptions | null;
  listAvailability(): ProviderAvailabilityDefinition[];
}
