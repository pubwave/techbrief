export function resolveApiInput(input: string): string {
  if (typeof window === "undefined" || !input.startsWith("/")) {
    return input;
  }

  if (window.location.port !== "4320") {
    return input;
  }

  return `${window.location.protocol}//${window.location.hostname}:4310${input}`;
}

export async function fetchJson<T>(input: string): Promise<T> {
  const response = await fetch(resolveApiInput(input));

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}
