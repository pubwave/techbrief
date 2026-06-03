import { addCustomSource, listAllSources, updateSourceState } from "@techbrief/runtime";
import { validateCustomSource } from "@techbrief/ingest";
import type { CustomSourceInput } from "@techbrief/shared";
import type { RequestContext } from "../http.js";
import { sendJson } from "../http.js";
import { readJsonBody } from "../body.js";

function parseSourceId(pathname: string): string | null {
  const match = pathname.match(/^\/v1\/sources\/([^/]+)$/);
  return match?.[1] ?? null;
}

export async function handleSourcesRoute(context: RequestContext): Promise<void> {
  const { request, response, url } = context;

  if (request.method === "GET" && url.pathname === "/v1/sources") {
    sendJson(response, 200, await listAllSources());
    return;
  }

  if (request.method === "POST" && url.pathname === "/v1/sources/validate") {
    const input = await readJsonBody<CustomSourceInput>(request);
    sendJson(response, 200, validateCustomSource(input));
    return;
  }

  if (request.method === "POST" && url.pathname === "/v1/sources") {
    const input = await readJsonBody<CustomSourceInput>(request);
    const result = await addCustomSource(input);
    sendJson(response, result.validation.accepted ? 201 : 422, result);
    return;
  }

  if (request.method === "PATCH") {
    const sourceId = parseSourceId(url.pathname);

    if (!sourceId) {
      sendJson(response, 404, { error: "Source was not found." });
      return;
    }

    const body = await readJsonBody<{ state: "enabled" | "disabled" }>(request);
    const updated = await updateSourceState(sourceId, body.state);
    sendJson(response, updated ? 200 : 404, updated ?? { error: "Source was not found." });
    return;
  }

  sendJson(response, 405, { error: "Method not allowed." });
}
