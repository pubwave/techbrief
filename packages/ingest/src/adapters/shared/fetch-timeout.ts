// Node's global fetch (undici) only falls back to long default timeouts
// (~300s headers/body), so a slow or hung source URL stalls a sync worker for
// minutes. Cap every source fetch explicitly: a source that hasn't responded in
// its window is treated as failed and skipped.

// Listing/API fetches (RSS, JSON endpoints) are normally fast.
export const SOURCE_FETCH_TIMEOUT_MS = 15_000;

// Detail body hydration fetches a full article HTML page, which can be large and
// served by a slow upstream, so it gets a longer budget than listing fetches.
export const DETAIL_FETCH_TIMEOUT_MS = 30_000;

// AbortSignal that aborts the fetch after the given window (defaults to the
// listing budget). The resulting AbortError is caught by the adapters' existing
// try/catch and surfaced via formatFetchError as a skip reason.
export function sourceFetchSignal(timeoutMs: number = SOURCE_FETCH_TIMEOUT_MS): AbortSignal {
  return AbortSignal.timeout(timeoutMs);
}
