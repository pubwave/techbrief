import { probeCommand } from "../paths/workspace.js";

export interface DoctorCheck {
  label: string;
  ok: boolean;
  detail: string;
}

function firstOutputLine(output: string, fallback: string): string {
  return output.split("\n").map((line) => line.trim()).find(Boolean) ?? fallback;
}

function probeVersion(label: string, command: string, args: string[]): DoctorCheck {
  const result = probeCommand(command, args);

  return {
    label,
    ok: result.ok,
    detail: result.ok
      ? firstOutputLine(result.stdout || result.stderr, "available")
      : firstOutputLine(result.stderr || result.stdout, "not detected")
  };
}

function probeBinary(label: string, command: string): DoctorCheck {
  const result = probeCommand("sh", ["-lc", `command -v ${command}`]);

  return {
    label,
    ok: result.ok,
    detail: result.ok
      ? firstOutputLine(result.stdout, "available")
      : firstOutputLine(result.stderr || result.stdout, "not detected")
  };
}

export function runDoctorChecks(): DoctorCheck[] {
  const versionChecks = [
    { label: "Node.js", command: "node", args: ["--version"] },
    { label: "npm", command: "npm", args: ["--version"] },
    { label: "Docker", command: "docker", args: ["--version"] },
    { label: "ADB", command: "adb", args: ["version"] },
    { label: "Xcode", command: "xcodebuild", args: ["-version"] },
    { label: "CocoaPods", command: "pod", args: ["--version"] },
    { label: "Ollama", command: "ollama", args: ["--version"] }
  ];

  const deviceProbe = probeCommand("flutter", ["devices", "--machine"]);
  const flutterDevices = deviceProbe.ok
    ? `${firstOutputLine(deviceProbe.stdout, "devices detected")}`
    : firstOutputLine(deviceProbe.stderr || deviceProbe.stdout, "device probe unavailable");

  return [
    ...versionChecks.map((item) => probeVersion(item.label, item.command, item.args)),
    probeBinary("Flutter", "flutter"),
    {
      label: "Flutter devices",
      ok: deviceProbe.ok,
      detail: flutterDevices
    }
  ];
}
