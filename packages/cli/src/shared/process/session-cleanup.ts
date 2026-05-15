type SessionCleanupTask = () => Promise<void> | void;

const sessionCleanupTasks = new Set<SessionCleanupTask>();
let cleanupStarted = false;

export function registerSessionCleanupTask(task: SessionCleanupTask): () => void {
  sessionCleanupTasks.add(task);
  return () => {
    sessionCleanupTasks.delete(task);
  };
}

export async function runSessionCleanupTasks(): Promise<void> {
  if (cleanupStarted) {
    return;
  }

  cleanupStarted = true;
  const tasks = Array.from(sessionCleanupTasks).reverse();
  sessionCleanupTasks.clear();

  for (const task of tasks) {
    try {
      await task();
    } catch {
      // Best-effort shutdown only.
    }
  }
}
