const DEFAULT_LOCAL_MODEL_PORT = 11434;
const LOCAL_CHAT_COMPLETIONS_PATH = "/v1/chat/completions";
const DEFAULT_LOCAL_HOST = "127.0.0.1";
const DEFAULT_LOCAL_BIND_HOST = "0.0.0.0";

export function resolveDefaultLocalBaseUrl(): string {
  return `${resolveDefaultLocalOrigin()}${LOCAL_CHAT_COMPLETIONS_PATH}`;
}

export function resolveDefaultLocalHost(): string {
  const override = parseLocalHostOverride();
  if (override) {
    return override.host;
  }

  return DEFAULT_LOCAL_HOST;
}

export function resolveDefaultLocalBindHost(): string {
  const override = parseLocalHostOverride();
  if (override) {
    return override.host;
  }

  return DEFAULT_LOCAL_BIND_HOST;
}

export function resolveDefaultLocalOrigin(): string {
  const override = parseLocalHostOverride();
  if (override) {
    return `http://${override.host}:${override.port}`;
  }

  return `http://${resolveDefaultLocalHost()}:${DEFAULT_LOCAL_MODEL_PORT}`;
}
function parseLocalHostOverride(): { host: string; port: number } | null {
  const raw = process.env.OLLAMA_HOST?.trim();
  if (!raw) {
    return null;
  }

  try {
    const normalized = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `http://${raw}`;
    const url = new URL(normalized);
    return {
      host: url.hostname,
      port: Number.parseInt(url.port || String(DEFAULT_LOCAL_MODEL_PORT), 10)
    };
  } catch {
    return null;
  }
}
