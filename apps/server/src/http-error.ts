// A typed error carrying an HTTP status, so route handlers can signal client
// errors (400/404/413/…) explicitly. The top-level handler maps these to their
// status and treats every other thrown error as a 500 — instead of disguising
// internal/DB/AI failures as 400 client errors.
export class HttpError extends Error {
  constructor(
    readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}
