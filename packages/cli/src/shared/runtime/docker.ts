import { formatCommand, runCommand, workspaceRoot } from "../paths/workspace.js";

const composeArgs = ["compose", "-f", "infra/docker-compose.yml"];

export function runDockerCompose(args: string[]) {
  return runCommand("docker", [...composeArgs, ...args], workspaceRoot);
}

export function formatDockerComposeCommand(args: string[]): string {
  return formatCommand("docker", [...composeArgs, ...args]);
}
