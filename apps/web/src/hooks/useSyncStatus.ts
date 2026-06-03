import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSchedule } from "../api/schedule";
import { streamFeedEvents } from "../api/feed";

const DEFAULT_INTERVAL_MINUTES = 15;
// If the countdown reaches zero but no feed_updated arrives (e.g. the sync ran
// but found nothing new), resolve the "syncing" state after this grace window
// so the UI doesn't get stuck. Kept comfortably above the server's 60s poll.
const SYNC_GRACE_MS = 90_000;

export interface SyncStatus {
  ready: boolean;
  syncing: boolean;
  remainingSeconds: number;
}

export function useSyncStatus(enabled: boolean): SyncStatus {
  const [intervalMs, setIntervalMs] = useState(DEFAULT_INTERVAL_MINUTES * 60_000);
  const [anchorMs, setAnchorMs] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const graceTimer = useRef<number | null>(null);

  const clearGrace = useCallback(() => {
    if (graceTimer.current !== null) {
      window.clearTimeout(graceTimer.current);
      graceTimer.current = null;
    }
  }, []);

  // Read the interval + real last sync time from the server. Called on mount and
  // again whenever the countdown resets, so a mid-session interval change is
  // picked up on the next sync without needing a page reload.
  const refreshSchedule = useCallback(async () => {
    try {
      const schedule = await fetchSchedule();
      const minutes = typeof schedule.intervalMinutes === "number" && schedule.intervalMinutes > 0
        ? schedule.intervalMinutes
        : DEFAULT_INTERVAL_MINUTES;
      setIntervalMs(minutes * 60_000);
      setAnchorMs(schedule.lastSyncAt ? Date.parse(schedule.lastSyncAt) : Date.now());
    } catch {
      setAnchorMs((previous) => previous ?? Date.now());
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void refreshSchedule();
  }, [enabled, refreshSchedule]);

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [enabled]);

  // A real sync (new articles detected) ends the syncing state and re-reads the
  // schedule so the countdown restarts from the authoritative last sync time and
  // the latest interval.
  useEffect(() => {
    if (!enabled) return;
    const stop = streamFeedEvents(() => {
      clearGrace();
      setSyncing(false);
      setAnchorMs(Date.now());
      void refreshSchedule();
    });
    return () => {
      stop();
      clearGrace();
    };
  }, [enabled, refreshSchedule, clearGrace]);

  const remainingSeconds = anchorMs === null
    ? 0
    : Math.max(0, Math.round((anchorMs + intervalMs - now) / 1000));

  // Enter "syncing" when the countdown reaches zero; arm a grace timer so a
  // no-op sync (no new articles) still resolves and the countdown resumes with a
  // freshly read schedule.
  useEffect(() => {
    if (!enabled || !ready || anchorMs === null) return;
    if (remainingSeconds <= 0 && !syncing) {
      setSyncing(true);
      clearGrace();
      graceTimer.current = window.setTimeout(() => {
        setSyncing(false);
        void refreshSchedule();
      }, SYNC_GRACE_MS);
    }
  }, [enabled, ready, anchorMs, remainingSeconds, syncing, clearGrace, refreshSchedule]);

  return { ready, syncing, remainingSeconds };
}
