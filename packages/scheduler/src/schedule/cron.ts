import { parseCronExpression, type ParsedCronExpression } from "./cron-parser.js";

const MAX_SEARCH_MINUTES = 366 * 24 * 60;

export function isValidCronExpression(cron: string): boolean {
  try {
    parseCronExpression(cron);
    return true;
  } catch {
    return false;
  }
}

export function getNextCronOccurrence(cron: string, after: Date): Date {
  const parsed = parseCronExpression(cron);
  const candidate = new Date(after.getTime());
  candidate.setUTCSeconds(0, 0);
  candidate.setUTCMinutes(candidate.getUTCMinutes() + 1);

  for (let minuteOffset = 0; minuteOffset < MAX_SEARCH_MINUTES; minuteOffset += 1) {
    if (matchesParsedCron(parsed, candidate)) {
      return new Date(candidate.getTime());
    }

    candidate.setUTCMinutes(candidate.getUTCMinutes() + 1);
  }

  throw new Error(`Unable to resolve next cron occurrence within ${MAX_SEARCH_MINUTES} minutes: ${cron}`);
}

function matchesParsedCron(parsed: ParsedCronExpression, candidate: Date): boolean {
  const timeMatches = parsed.minutes.includes(candidate.getUTCMinutes())
    && parsed.hours.includes(candidate.getUTCHours())
    && parsed.months.includes(candidate.getUTCMonth() + 1);
  if (!timeMatches) {
    return false;
  }

  const dayOfMonthMatches = parsed.dayOfMonth.includes(candidate.getUTCDate());
  const dayOfWeekMatches = parsed.dayOfWeek.includes(candidate.getUTCDay());

  // Standard cron: when both day fields are restricted, match if EITHER matches;
  // otherwise the wildcard field matches everything, so AND is equivalent.
  return parsed.dayOfMonthRestricted && parsed.dayOfWeekRestricted
    ? dayOfMonthMatches || dayOfWeekMatches
    : dayOfMonthMatches && dayOfWeekMatches;
}
