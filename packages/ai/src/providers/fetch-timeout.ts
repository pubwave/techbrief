// Total-duration cap for non-streaming AI calls (summary/translate-in-one).
// Generous, because a long article can legitimately take tens of seconds; this
// only guards against a provider that accepts the request then never responds.
//
// Streaming calls (translateBodyChunk) deliberately do NOT use a total-duration
// signal — aborting after a fixed window would kill a healthy long generation.
// They rely on undici's idle bodyTimeout (~300s), which aborts a truly hung
// stream (no bytes received) without cutting off one that is still producing.
export const AI_REQUEST_TIMEOUT_MS = 300_000;
