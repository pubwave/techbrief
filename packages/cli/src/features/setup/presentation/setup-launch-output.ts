import { normalizeCommandOutputLines } from "../../../shared/process/command-output.js";
import type { ProgressLine } from "../types.js";

export function normalizeSetupOutputLines(rawText: string): string[] {
  return normalizeCommandOutputLines(rawText)
    .map((line) => sanitizeOllamaOutput(stripTrailingEta(line)))
    .filter((line) => !isSetupNoiseLine(line));
}

export function mergeOutputLines(currentLines: ProgressLine[], incomingLines: ProgressLine[]): ProgressLine[] {
  return incomingLines.reduce((lines, line) => {
    const progressKey = setupOutputProgressKey(line.text);
    if (!progressKey) {
      return [...lines, line];
    }

    const nextLines = [...lines];
    const existingIndex = nextLines.findIndex((currentLine) => setupOutputProgressKey(currentLine.text) === progressKey);

    if (existingIndex >= 0) {
      nextLines[existingIndex] = line;
      return nextLines;
    }

    nextLines.push(line);
    return nextLines;
  }, currentLines);
}

function stripTrailingEta(line: string): string {
  return line.replace(/\s+\d+h\d+m\d+s$/i, "")
    .replace(/\s+\d+m\d+s$/i, "")
    .replace(/\s+\d+s$/i, "");
}

function sanitizeOllamaOutput(line: string): string {
  return line
    .replace(/^>>>\s+/g, "")
    .replace(/\s+[▕▏▎▍▌▋▊▉█]+\s+/g, " ")
    .replace(/\s+[▕▏▎▍▌▋▊▉█]+(?:\s+[▕▏▎▍▌▋▊▉█]+)*\s+/g, " ")
    .replace(/\s+\|\s+/g, " ")
    .trim();
}

function setupOutputProgressKey(line: string): string | null {
  const normalized = line.trim().toLowerCase();
  if (/^\d+(\.\d+)?%$/.test(normalized)) {
    return "download-progress";
  }

  if (!normalized.startsWith("pulling ")) {
    return null;
  }

  const remainder = normalized.slice("pulling ".length).trim();
  const key = remainder.split(/[\s:]+/)[0];
  return key || null;
}

function isSetupNoiseLine(line: string): boolean {
  const normalized = line.trim();

  return (
    normalized.includes(".techbrief/scheduler-state.json") ||
    normalized.includes(".techbrief\\scheduler-state.json") ||
    /^>>> Downloading Ollama for /i.test(normalized) ||
    /^\d+(\.\d+)?%$/.test(normalized) ||
    /^#+$/.test(normalized) ||
    /^[#=\-O\s]+$/.test(normalized) ||
    /^#+\s+\d+(\.\d+)?%$/.test(normalized) ||
    /^\d+(\.\d+)?%\s+#+$/.test(normalized)
  );
}
