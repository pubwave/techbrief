import type { MobilePlatform } from "./features/mobile-install/index.js";

export interface LaunchOptions {
  apiPort?: number;
  webPort?: number;
  host?: string;
  noOpen?: boolean;
  noMobile?: boolean;
  session?: boolean;
  mobilePlatform?: MobilePlatform;
  templateUrl?: string;
}

export function parseLaunchOptions(options: Record<string, string | boolean>): LaunchOptions {
  return {
    ...(typeof options["api-port"] === "string" ? { apiPort: Number.parseInt(options["api-port"], 10) } : {}),
    ...(typeof options["web-port"] === "string" ? { webPort: Number.parseInt(options["web-port"], 10) } : {}),
    ...(typeof options.host === "string" ? { host: options.host } : {}),
    ...(typeof options["template-url"] === "string" ? { templateUrl: options["template-url"] } : {}),
    ...(options["mobile-platform"] === "ios" || options["mobile-platform"] === "android"
      ? { mobilePlatform: options["mobile-platform"] }
      : {}),
    noOpen: options["no-open"] === true,
    noMobile: options["no-mobile"] === true,
    session: options.session === true
  };
}
