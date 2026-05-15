let selectedCommand: string | null = null;

export function setSelectedCommand(command: string | null): void {
  selectedCommand = command;
}

export function consumeSelectedCommand(): string | null {
  const current = selectedCommand;
  selectedCommand = null;
  return current;
}
