import { describe, expect, it } from "vitest";
import { formatFetchError } from "../../packages/ingest/src/adapters/shared/fetch-error.js";

describe("formatFetchError", () => {
  it("returns a fallback for non-Error values", () => {
    expect(formatFetchError("boom")).toBe("Unknown fetch error.");
    expect(formatFetchError(undefined)).toBe("Unknown fetch error.");
  });

  it("uses the error message", () => {
    expect(formatFetchError(new Error("fetch failed"))).toBe("fetch failed");
  });

  it("appends a nested Error cause", () => {
    const error = new Error("fetch failed", { cause: new Error("ECONNREFUSED") });
    expect(formatFetchError(error)).toBe("fetch failed | ECONNREFUSED");
  });

  it("pulls code and message from an object cause", () => {
    const error = new Error("fetch failed", { cause: { code: "ETIMEDOUT", message: "timed out" } });
    expect(formatFetchError(error)).toBe("fetch failed | ETIMEDOUT | timed out");
  });

  it("dedupes repeated detail strings", () => {
    const error = new Error("same", { cause: new Error("same") });
    expect(formatFetchError(error)).toBe("same");
  });
});
