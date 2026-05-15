import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

export interface RequestContext {
  request: IncomingMessage;
  response: ServerResponse<IncomingMessage>;
  url: URL;
}

export type RouteHandler = (context: RequestContext) => void | Promise<void>;

export function createJsonServer(routeHandler: RouteHandler) {
  return createServer((request, response) => {
    applyCommonHeaders(response);
    const host = request.headers.host ?? "127.0.0.1";
    const url = new URL(request.url ?? "/", `http://${host}`);
    void routeHandler({ request, response, url });
  });
}

export function sendJson(response: ServerResponse<IncomingMessage>, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload, null, 2));
}

export function sendNoContent(response: ServerResponse<IncomingMessage>, statusCode = 204): void {
  response.writeHead(statusCode);
  response.end();
}

export function openSseStream(response: ServerResponse<IncomingMessage>): void {
  response.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive",
    "x-accel-buffering": "no"
  });
  response.flushHeaders();
  response.write(": connected\n\n");
}

export function sendSseEvent(response: ServerResponse<IncomingMessage>, event: string, payload: unknown): void {
  response.write(`event: ${event}\n`);
  response.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function applyCommonHeaders(response: ServerResponse<IncomingMessage>): void {
  response.setHeader("access-control-allow-origin", "*");
  response.setHeader("access-control-allow-methods", "GET,POST,PUT,PATCH,OPTIONS");
  response.setHeader("access-control-allow-headers", "content-type");
}
