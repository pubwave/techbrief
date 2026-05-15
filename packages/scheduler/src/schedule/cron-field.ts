export interface CronFieldSpec {
  min: number;
  max: number;
}

export function parseCronField(field: string, spec: CronFieldSpec): number[] {
  const values = new Set<number>();

  for (const rawPart of field.split(",")) {
    const part = rawPart.trim();
    if (part.length === 0) {
      throw new Error(`Invalid cron field: ${field}`);
    }

    for (const value of expandCronPart(part, spec)) {
      values.add(value);
    }
  }

  return [...values].sort((left, right) => left - right);
}

function expandCronPart(part: string, spec: CronFieldSpec): number[] {
  if (part === "*") {
    return buildRange(spec.min, spec.max, 1);
  }

  const stepIndex = part.indexOf("/");
  if (stepIndex >= 0) {
    const rangePart = part.slice(0, stepIndex);
    const stepPart = part.slice(stepIndex + 1);
    const step = parsePositiveInteger(stepPart, `Invalid cron step: ${part}`);
    const [start, end] = parseRange(rangePart === "*" ? `${spec.min}-${spec.max}` : rangePart, spec);
    return buildRange(start, end, step);
  }

  const [start, end] = parseRange(part, spec);
  return buildRange(start, end, 1);
}

function parseRange(input: string, spec: CronFieldSpec): [number, number] {
  if (!input.includes("-")) {
    const exact = parseBoundedInteger(input, spec, `Invalid cron value: ${input}`);
    return [exact, exact];
  }

  const [rawStart, rawEnd] = input.split("-", 2);
  const start = parseBoundedInteger(rawStart ?? "", spec, `Invalid cron range: ${input}`);
  const end = parseBoundedInteger(rawEnd ?? "", spec, `Invalid cron range: ${input}`);
  if (start > end) {
    throw new Error(`Invalid cron range: ${input}`);
  }

  return [start, end];
}

function parseBoundedInteger(input: string, spec: CronFieldSpec, message: string): number {
  const value = parsePositiveInteger(input, message);
  if (value < spec.min || value > spec.max) {
    throw new Error(message);
  }

  return value;
}

function parsePositiveInteger(input: string, message: string): number {
  const value = Number.parseInt(input, 10);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(message);
  }

  return value;
}

function buildRange(start: number, end: number, step: number): number[] {
  if (!Number.isFinite(step) || step <= 0) {
    throw new Error(`Invalid cron step: ${step}`);
  }

  const values: number[] = [];
  for (let current = start; current <= end; current += step) {
    values.push(current);
  }
  return values;
}
