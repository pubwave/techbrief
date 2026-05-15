const ANSI_PATTERN = /\u001B\[[0-9;?]*[ -/]*[@-~]/g;

export function normalizeCommandOutputLines(rawText: string): string[] {
  return rawText
    .replace(ANSI_PATTERN, "")
    .split(/\r\n|\n|\r/g)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function extractCommandFailureDetail(stderr: string, stdout: string): string | null {
  const stderrLines = normalizeCommandOutputLines(stderr);
  const stdoutLines = normalizeCommandOutputLines(stdout);
  const candidates = [...stderrLines, ...stdoutLines].filter((line) => !isNoiseLine(line));

  if (candidates.length === 0) {
    return null;
  }

  return candidates[candidates.length - 1] ?? null;
}

function isNoiseLine(line: string): boolean {
  return (
    /^#+$/.test(line) ||
    /^#+\s+\d+(\.\d+)?%$/.test(line) ||
    /^\d+(\.\d+)?%$/.test(line) ||
    /^[#=\-_\s]+$/.test(line) ||
    /^#+[-=]+#/.test(line) ||
    /^>>> Downloading Ollama for /.test(line)
  );
}
