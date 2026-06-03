const DISPLAY_MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

export function normalizePublishedAt(value?: string | null): string | undefined {
  const normalized = value?.trim();
  if (!normalized) {
    return undefined;
  }

  const displayDate = normalized.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})$/i);
  if (displayDate) {
    const [, monthText, dayText, yearText] = displayDate;
    if (monthText && dayText && yearText) {
      const month = DISPLAY_MONTHS.indexOf(monthText.toLowerCase());
      if (month >= 0) {
        return new Date(Date.UTC(Number(yearText), month, Number(dayText))).toISOString();
      }
    }
  }

  const parsed = Date.parse(normalized);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : undefined;
}

export function extractPublishedAtFromUrl(url: string): string | undefined {
  try {
    const { pathname } = new URL(url);
    const dashed = pathname.match(/(?:^|\/)(\d{4})-(\d{2})-(\d{2})(?:\/|$)/);
    const slashed = pathname.match(/(?:^|\/)(\d{4})\/(\d{1,2})\/(\d{1,2})(?:\/|$)/);
    const match = dashed ?? slashed;
    if (!match) {
      return undefined;
    }

    const [, yearText, monthText, dayText] = match;
    if (!yearText || !monthText || !dayText) {
      return undefined;
    }

    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      return undefined;
    }

    return date.toISOString();
  } catch {
    return undefined;
  }
}
