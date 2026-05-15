import { GLOBAL_OPTIONS, findCommandSpec } from "./command-spec.js";

export interface CommandValidationIssue {
  type: "command" | "option";
  value: string;
}

export interface CommandValidationResult {
  kind: "ok" | "help" | "version";
  issue?: CommandValidationIssue;
}

export function validateCommandInput(
  command: string,
  options: Record<string, string | boolean>
): CommandValidationResult {
  if (options.version === true || command === "version") {
    return { kind: "version" };
  }

  if (options.help === true || command === "help") {
    return { kind: "help" };
  }

  const commandSpec = findCommandSpec(command);
  if (!commandSpec) {
    return {
      kind: "help",
      issue: {
        type: "command",
        value: command
      }
    };
  }

  const allowedOptions = new Set<string>([...GLOBAL_OPTIONS, ...commandSpec.options]);
  for (const option of Object.keys(options)) {
    if (!allowedOptions.has(option)) {
      return {
        kind: "help",
        issue: {
          type: "option",
          value: `--${option}`
        }
      };
    }
  }

  return { kind: "ok" };
}
