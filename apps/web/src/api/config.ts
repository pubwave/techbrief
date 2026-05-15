import { fetchJson } from "./http";

interface ConfigResponse {
  app?: {
    defaultLanguage?: string;
  };
}

export async function fetchDefaultLanguage(): Promise<string> {
  const config = await fetchJson<ConfigResponse>("/v1/config");
  return config.app?.defaultLanguage ?? "en";
}
