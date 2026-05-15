import type { ProviderAvailability } from "../types.js";
import { resolveDefaultLocalOrigin } from "./local-base-url.js";
import { DEFAULT_LOCAL_PROVIDER_CAPABILITIES } from "./provider-capabilities.js";

interface OllamaTagsResponse {
  models?: Array<{
    model?: string;
    name?: string;
  }>;
}

export async function inspectLocalProviderAvailability(model: string): Promise<ProviderAvailability> {
  const baseDetail = `Uses local Ollama default at ${resolveDefaultLocalOrigin()}`;
  const versionReady = await isLocalRuntimeReachable();

  if (!versionReady) {
    return {
      provider: "local",
      available: false,
      configured: true,
      status: "runtime-unavailable",
      detail: `${baseDetail}. Runtime is not reachable.`,
      capabilities: DEFAULT_LOCAL_PROVIDER_CAPABILITIES
    };
  }

  const installedModels = await listInstalledLocalModels();
  if (!installedModels.includes(model)) {
    return {
      provider: "local",
      available: false,
      configured: true,
      status: "model-missing",
      detail: `${baseDetail}. Model ${model} is not installed.`,
      capabilities: DEFAULT_LOCAL_PROVIDER_CAPABILITIES
    };
  }

  return {
    provider: "local",
    available: true,
    configured: true,
    status: "ready",
    detail: `${baseDetail}. Model ${model} is ready.`,
    capabilities: DEFAULT_LOCAL_PROVIDER_CAPABILITIES
  };
}

async function isLocalRuntimeReachable(): Promise<boolean> {
  try {
    const response = await fetch(`${resolveDefaultLocalOrigin()}/api/version`, {
      signal: AbortSignal.timeout(1500)
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function listInstalledLocalModels(): Promise<string[]> {
  try {
    const response = await fetch(`${resolveDefaultLocalOrigin()}/api/tags`, {
      signal: AbortSignal.timeout(1500)
    });
    if (!response.ok) {
      return [];
    }

    const payload = await response.json() as OllamaTagsResponse;
    return (payload.models ?? [])
      .map((model) => model.model ?? model.name ?? "")
      .map((name) => name.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}
