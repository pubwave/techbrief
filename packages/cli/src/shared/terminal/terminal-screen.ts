const ENTER_ALTERNATE_SCREEN = "\u001B[?1049h\u001B[2J\u001B[H";
const EXIT_ALTERNATE_SCREEN = "\u001B[?1049l";

let isAlternateScreenActive = false;

export function enterAlternateScreen(): (() => void) | null {
  if (!process.stdout.isTTY) {
    return null;
  }

  process.stdout.write(ENTER_ALTERNATE_SCREEN);
  isAlternateScreenActive = true;

  let active = true;

  return () => {
    if (!active || !process.stdout.isTTY) {
      return;
    }

    active = false;
    isAlternateScreenActive = false;
    process.stdout.write(EXIT_ALTERNATE_SCREEN);
  };
}

export function suspendTerminalScreen<T>(action: () => T): T {
  const shouldRestoreAlternateScreen = isAlternateScreenActive && process.stdout.isTTY;
  const stdin = process.stdin as NodeJS.ReadStream & {
    isRaw?: boolean;
    setRawMode?: (mode: boolean) => void;
  };
  const canToggleRawMode = Boolean(stdin.isTTY && typeof stdin.setRawMode === "function");
  const wasRawModeEnabled = canToggleRawMode && stdin.isRaw === true;

  if (shouldRestoreAlternateScreen) {
    isAlternateScreenActive = false;
    process.stdout.write(EXIT_ALTERNATE_SCREEN);
  }

  if (wasRawModeEnabled) {
    stdin.setRawMode?.(false);
  }

  try {
    return action();
  } finally {
    if (wasRawModeEnabled) {
      stdin.setRawMode?.(true);
    }

    if (shouldRestoreAlternateScreen && process.stdout.isTTY) {
      process.stdout.write(ENTER_ALTERNATE_SCREEN);
      isAlternateScreenActive = true;
    }
  }
}
