export interface LaunchOptions {
  apiPort?: number;
  webPort?: number;
  host?: string;
  noOpen?: boolean;
  session?: boolean;
  templateUrl?: string;
}

export function parseLaunchOptions(options: Record<string, string | boolean>): LaunchOptions {
  return {
    ...(typeof options["api-port"] === "string" ? { apiPort: Number.parseInt(options["api-port"], 10) } : {}),
    ...(typeof options["web-port"] === "string" ? { webPort: Number.parseInt(options["web-port"], 10) } : {}),
    ...(typeof options.host === "string" ? { host: options.host } : {}),
    ...(typeof options["template-url"] === "string" ? { templateUrl: options["template-url"] } : {}),
    noOpen: options["no-open"] === true,
    session: options.session === true
  };
}
