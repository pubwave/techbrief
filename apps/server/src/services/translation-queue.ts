interface TranslationTask<T> {
  run: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
}

const DEFAULT_CONCURRENCY = 1;

const pendingTasks: Array<TranslationTask<any>> = [];
let activeTaskCount = 0;
let maxConcurrentTasks = DEFAULT_CONCURRENCY;

export function setTranslationQueueConcurrency(value: number): void {
  const normalizedValue = Number.isFinite(value) ? Math.max(1, Math.floor(value)) : DEFAULT_CONCURRENCY;
  maxConcurrentTasks = normalizedValue;
  pumpTranslationQueue();
}

export function enqueueTranslationTask<T>(run: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    pendingTasks.push({
      run,
      resolve,
      reject
    });
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

async function runQueuedTask(task: TranslationTask<any>): Promise<void> {
  try {
    task.resolve(await task.run());
  } catch (error) {
    task.reject(error);
  } finally {
    activeTaskCount = Math.max(0, activeTaskCount - 1);
    pumpTranslationQueue();
  }
}
