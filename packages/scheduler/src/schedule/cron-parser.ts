import { parseCronField } from "./cron-field.js";

export interface ParsedCronExpression {
  minutes: number[];
  hours: number[];
  dayOfMonth: number[];
  months: number[];
  dayOfWeek: number[];
  // Standard cron treats day-of-month and day-of-week as OR when both are
  // restricted (neither is "*"). Track whether each was a wildcard so the
  // matcher can apply that rule. A leading "*" (including "*/n") is wildcard.
  dayOfMonthRestricted: boolean;
  dayOfWeekRestricted: boolean;
}

export function parseCronExpression(cron: string): ParsedCronExpression {
  const fields = cron.trim().split(/\s+/);
  if (fields.length !== 5) {
    throw new Error(`Invalid cron expression: ${cron}`);
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = fields;
  return {
    minutes: parseCronField(minute ?? "", { min: 0, max: 59 }),
    hours: parseCronField(hour ?? "", { min: 0, max: 23 }),
    dayOfMonth: parseCronField(dayOfMonth ?? "", { min: 1, max: 31 }),
    months: parseCronField(month ?? "", { min: 1, max: 12 }),
    dayOfWeek: parseCronField(dayOfWeek ?? "", { min: 0, max: 6 }),
    dayOfMonthRestricted: !(dayOfMonth ?? "*").startsWith("*"),
    dayOfWeekRestricted: !(dayOfWeek ?? "*").startsWith("*")
  };
}
