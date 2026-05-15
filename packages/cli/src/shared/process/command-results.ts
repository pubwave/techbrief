import { createLine } from "../ui/ui.js";

function detectSandboxFlutterPermissionError(stderr: string): boolean {
  return stderr.includes("engine.stamp") && stderr.includes("Operation not permitted");
}

function detectSandboxDockerPermissionError(stderr: string): boolean {
  return stderr.includes("docker.sock") && stderr.includes("operation not permitted");
}

export function commandResultLines(commandLabel: string, result: { ok: boolean; stderr: string }, successColor: "green" | "red" = "green") {
  const lines = [
    createLine(`${result.ok ? "OK" : "FAIL"} ${commandLabel}`, result.ok ? successColor : "red")
  ];

  if (result.stderr) {
    lines.push(createLine(result.stderr.split("\n")[0] ?? "", result.ok ? undefined : "yellow"));
  }

  if (!result.ok && detectSandboxFlutterPermissionError(result.stderr)) {
    lines.push(createLine("Current sandbox blocks Flutter cache writes. This should work in a normal local shell.", "yellow"));
  }

  if (!result.ok && detectSandboxDockerPermissionError(result.stderr)) {
    lines.push(createLine("Current sandbox cannot access the Docker daemon socket. The compose files themselves are valid.", "yellow"));
  }

  return lines;
}
