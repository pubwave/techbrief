import { useStdout } from "ink";

interface TerminalSize {
  rows: number;
  columns: number;
}

export function useTerminalSize(): TerminalSize {
  const { stdout } = useStdout();

  return {
    rows: stdout.rows ?? 24,
    columns: stdout.columns ?? 80
  };
}
