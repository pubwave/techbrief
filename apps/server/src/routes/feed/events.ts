import type { IncomingMessage, ServerResponse } from "node:http";
import { getArticleFeedRevision } from "@techbrief/runtime";
import type { RequestContext } from "../../http.js";
import { openSseStream, sendSseEvent } from "../../http.js";

type SseClient = { id: number; response: ServerResponse<IncomingMessage> };

let clients: SseClient[] = [];
let nextClientId = 0;
let pollerStarted = false;
let lastRevision: string | null = null;

function startPoller(): void {
  if (pollerStarted) return;
  pollerStarted = true;

  void getArticleFeedRevision().then((revision) => {
    lastRevision = revision;
  });

  setInterval(() => {
    void getArticleFeedRevision().then((revision) => {
      // Only broadcast once a baseline exists, so the first tick after startup
      // doesn't fire a spurious update before lastRevision is initialized.
      if (lastRevision !== null && revision !== lastRevision) {
        lastRevision = revision;
        broadcastFeedUpdated();
      }
    });
  }, 60_000);
}

function broadcastFeedUpdated(): void {
  clients = clients.filter((client) => {
    try {
      sendSseEvent(client.response, "feed_updated", {});
      return true;
    } catch {
      return false;
    }
  });
}

export async function handleFeedEventsRoute({ request, response }: RequestContext): Promise<void> {
  startPoller();
  openSseStream(response);

  const id = ++nextClientId;
  clients.push({ id, response });

  const heartbeat = setInterval(() => {
    try {
      response.write(": heartbeat\n\n");
    } catch {
      clearInterval(heartbeat);
    }
  }, 30_000);

  request.on("close", () => {
    clearInterval(heartbeat);
    clients = clients.filter((c) => c.id !== id);
  });
}
