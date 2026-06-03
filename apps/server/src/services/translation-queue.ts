interface QueuedTranslationTask {
  run: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

const DEFAULT_CONCURRENCY = 1;

const pendingTasks: QueuedTranslationTask[] = [];
let activeTaskCount = 0;
let maxConcurrentTasks = DEFAULT_CONCURRENCY;

export function setTranslationQueueConcurrency(value: number): void {
  const normalizedValue = Number.isFinite(value) ? Math.max(1, Math.floor(value)) : DEFAULT_CONCURRENCY;
  maxConcurrentTasks = normalizedValue;
  pumpTranslationQueue();
}

export function enqueueTranslationTask<T>(run: () => Promise<T>, priority = false): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const task: QueuedTranslationTask = { run, resolve: (value) => resolve(value as T), reject };
    if (priority) {
      pendingTasks.unshift(task);
    } else {
      pendingTasks.push(task);
    }
    pumpTranslationQueue();
  });
}

function pumpTranslationQueue(): void {
  while (activeTaskCount < maxConcurrentTasks) {
    const nextTask = pendingTasks.shift();
    if (!nextTask) {
      return;
    }

    activeTaskCount += 1;
    void runQueuedTask(nextTask);
  }
}

async function runQueuedTask(task: QueuedTranslationTask): Promise<void> {
  try {
    task.resolve(await task.run());
  } catch (error) {
    task.reject(error);
  } finally {
    activeTaskCount = Math.max(0, activeTaskCount - 1);
    pumpTranslationQueue();
  }
}
