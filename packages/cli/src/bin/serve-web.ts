import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import path from "node:path";
import { createServer } from "node:http";
import http from "node:http";
import https from "node:https";

const webRoot = process.env.TECHBRIEF_WEB_DIST ?? "";
const apiBaseUrl = process.env.TECHBRIEF_API_BASE_URL ?? "http://127.0.0.1:9541";
const host = process.env.HOST ?? "127.0.0.1";
const port = Number.parseInt(process.env.PORT ?? "9540", 10);

const mimeTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function sendProxyError(response: import("node:http").ServerResponse, error: unknown): void {
  if (response.destroyed || response.writableEnded) {
    return;
  }

  if (response.headersSent) {
    response.end();
    return;
  }

  response.writeHead(502, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify({
    error: "proxy_error",
    message: error instanceof Error ? error.message : "Unknown proxy error."
  }));
}

async function proxyRequest(request: import("node:http").IncomingMessage, response: import("node:http").ServerResponse, requestUrl: URL): Promise<void> {
  const upstreamUrl = new URL(requestUrl.pathname + requestUrl.search, apiBaseUrl);
  await new Promise<void>((resolve, reject) => {
    const proxyClient = upstreamUrl.protocol === "https:" ? https : http;
    const upstreamRequest = proxyClient.request(upstreamUrl, {
      method: request.method ?? "GET",
      headers: request.headers
    }, (upstreamResponse) => {
      if (response.destroyed || response.writableEnded) {
        upstreamResponse.destroy();
        resolve();
        return;
      }

      response.writeHead(
        upstreamResponse.statusCode ?? 502,
        filterProxyHeaders(upstreamResponse.headers)
      );
      response.flushHeaders();
      upstreamResponse.on("data", (chunk) => {
        if (response.destroyed || response.writableEnded) {
          upstreamResponse.destroy();
          return;
        }

        response.write(chunk);
      });
      upstreamResponse.on("end", () => {
        if (!response.destroyed && !response.writableEnded) {
          response.end();
        }

        resolve();
      });
      upstreamResponse.on("error", (error) => {
        if (!response.destroyed && !response.writableEnded) {
          reject(error);
          return;
        }

        resolve();
      });
    });
    const closeUpstream = () => {
      upstreamRequest.destroy();
      resolve();
    };

    upstreamRequest.on("error", (error) => {
      if (response.destroyed || response.writableEnded || request.destroyed) {
        resolve();
        return;
      }

      reject(error);
    });

    // Only close upstream when the *client* disconnects mid-response.
    // Do NOT listen to request "close"/"aborted" — for GET requests the request
    // stream closes immediately (no body), which would destroy the upstream
    // connection before the response arrives.
    response.on("close", closeUpstream);

    const methodHasBody = request.method === "POST" || request.method === "PUT" || request.method === "PATCH";
    if (methodHasBody) {
      request.pipe(upstreamRequest);
      return;
    }

    upstreamRequest.end();
  });
}

function filterProxyHeaders(headers: import("node:http").IncomingHttpHeaders): Record<string, string | string[]> {
  const nextHeaders: Record<string, string | string[]> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (!value || key === "connection" || key === "keep-alive" || key === "content-length") {
      continue;
    }

    nextHeaders[key] = value;
  }

  return nextHeaders;
}

async function serveFile(response: import("node:http").ServerResponse, filePath: string): Promise<void> {
  const fileStat = await stat(filePath);
  const extension = path.extname(filePath);

  response.writeHead(200, {
    "content-length": fileStat.size,
    "content-type": mimeTypes[extension] ?? "application/octet-stream"
  });

  createReadStream(filePath).pipe(response);
}

async function resolveAssetPath(requestPath: string): Promise<string> {
  const safePath = requestPath === "/" ? "/index.html" : requestPath;
  const assetPath = path.join(webRoot, safePath.replace(/^\/+/, ""));

  if (await pathExists(assetPath)) {
    return assetPath;
  }

  return path.join(webRoot, "index.html");
}

if (!webRoot) {
  throw new Error("TECHBRIEF_WEB_DIST is required.");
}

const server = createServer((request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);

  if (requestUrl.pathname.startsWith("/v1") || requestUrl.pathname === "/health") {
    void proxyRequest(request, response, requestUrl).catch((error) => sendProxyError(response, error));
    return;
  }

  void resolveAssetPath(requestUrl.pathname)
    .then((filePath) => serveFile(response, filePath))
    .catch((error) => {
      response.writeHead(500, { "content-type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({
        error: "web_serve_failed",
        message: error instanceof Error ? error.message : "Unknown web serve error."
      }));
    });
});

server.listen(port, host, () => {
  console.log(`TechBrief web listening on http://${host}:${port}`);
});
