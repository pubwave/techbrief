import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "../../apps/server/src/http-error.js";

// Mock the config route so we can make a handler throw and assert how the
// top-level router maps errors to status codes.
const { handleConfigRoute } = vi.hoisted(() => ({ handleConfigRoute: vi.fn() }));
vi.mock("../../apps/server/src/routes/config.js", () => ({ handleConfigRoute }));

import { handleRoute } from "../../apps/server/src/routes/index.js";

interface FakeRes {
  statusCode: number;
  body: string;
  writableEnded: boolean;
  writeHead: (code: number) => FakeRes;
  end: (body?: string) => FakeRes;
  setHeader: () => void;
}

function makeRes(): FakeRes {
  return {
    statusCode: 0,
    body: "",
    writableEnded: false,
    writeHead(code: number) {
      this.statusCode = code;
      return this;
    },
    end(body?: string) {
      if (body !== undefined) this.body = body;
      this.writableEnded = true;
      return this;
    },
    setHeader() {}
  };
}

function call(method: string, pathname: string, res: FakeRes) {
  return handleRoute({
    request: { method } as never,
    response: res as never,
    url: new URL(`http://127.0.0.1${pathname}`)
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("handleRoute", () => {
  it("answers OPTIONS preflight with 204", async () => {
    const res = makeRes();
    await call("OPTIONS", "/v1/config", res);
    expect(res.statusCode).toBe(204);
  });

  it("serves /health", async () => {
    const res = makeRes();
    await call("GET", "/health", res);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ status: "ok" });
  });

  it("returns 404 for an unknown route", async () => {
    const res = makeRes();
    await call("GET", "/v1/nope", res);
    expect(res.statusCode).toBe(404);
  });

  it("maps an HttpError to its status code", async () => {
    handleConfigRoute.mockRejectedValue(new HttpError(403, "forbidden"));
    const res = makeRes();
    await call("GET", "/v1/config", res);
    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res.body)).toEqual({ error: "forbidden" });
  });

  it("maps an unexpected error to 500 (not a disguised 400)", async () => {
    handleConfigRoute.mockRejectedValue(new Error("db exploded"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = makeRes();
    await call("GET", "/v1/config", res);
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body)).toEqual({ error: "Internal server error." });
    errorSpy.mockRestore();
  });
});
