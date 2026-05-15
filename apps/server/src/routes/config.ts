import { loadConfig, saveConfig } from "@techbrief/runtime";
import type { AppConfig } from "@techbrief/shared";
import type { RequestContext } from "../http.js";
import { sendJson } from "../http.js";
import { readJsonBody } from "../body.js";

export async function handleConfigRoute({ request, response }: RequestContext): Promise<void> {
  if (request.method === "GET") {
    sendJson(response, 200, await loadConfig());
    return;
  }

  if (request.method === "PUT") {
    const config = await readJsonBody<AppConfig>(request);
    await saveConfig(config);
    sendJson(response, 200, config);
    return;
  }

  sendJson(response, 405, { error: "Method not allowed." });
}
