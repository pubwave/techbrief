import { describe, expect, it } from "vitest";
import { HttpError } from "../../apps/server/src/http-error.js";

describe("HttpError", () => {
  it("carries a status code and message", () => {
    const error = new HttpError(413, "too big");
    expect(error.statusCode).toBe(413);
    expect(error.message).toBe("too big");
  });

  it("is an Error with the HttpError name", () => {
    const error = new HttpError(400, "bad");
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("HttpError");
  });
});
