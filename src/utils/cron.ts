/** Standard 5-field cron expression parsing, next-run-time calculation, and a plain-language summary. */

export class CronError extends Error {}

export interface CronField {
  values: Set<number>;
}

export interface ParsedCron {
  minute: CronField;
  hour: CronField;
  dayOfMonth: CronField;
  month: CronField;
  dayOfWeek: CronField;
  dayOfMonthIsWildcard: boolean;
  dayOfWeekIsWildcard: boolean;
}

type FieldName = 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek';

const FIELD_RANGES: Record<FieldName, [number, number]> = {
  minute: [0, 59],
  hour: [0, 23],
  dayOfMonth: [1, 31],
  month: [1, 12],
  dayOfWeek: [0, 7] // 0 and 7 both mean Sunday
};

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DOW_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function resolveNamedToken(token: string, field: FieldName): string {
  const upper = token.toUpperCase();
  if (field === 'month') {
    const idx = MONTH_NAMES.indexOf(upper);
    if (idx !== -1) return String(idx + 1);
  }
  if (field === 'dayOfWeek') {
    const idx = DOW_NAMES.indexOf(upper);
    if (idx !== -1) return String(idx);
  }
  return token;
}

function parseField(expr: string, field: FieldName): CronField {
  const [min, max] = FIELD_RANGES[field];
  const values = new Set<number>();

  for (const part of expr.split(',')) {
    const stepMatch = part.match(/^(.+)\/(\d+)$/);
    const base = stepMatch ? stepMatch[1] : part;
    const step = stepMatch ? parseInt(stepMatch[2], 10) : 1;
    if (step < 1) throw new CronError(`Invalid step in "${part}".`);

    const resolvedBase = resolveNamedToken(base, field);

    let rangeStart: number;
    let rangeEnd: number;
    if (resolvedBase === '*') {
      rangeStart = min;
      rangeEnd = max;
    } else if (resolvedBase.includes('-')) {
      const [aRaw, bRaw] = resolvedBase.split('-');
      const a = parseInt(resolveNamedToken(aRaw, field), 10);
      const b = parseInt(resolveNamedToken(bRaw, field), 10);
      if (Number.isNaN(a) || Number.isNaN(b)) throw new CronError(`Invalid range "${part}".`);
      rangeStart = a;
      rangeEnd = b;
    } else {
      const v = parseInt(resolvedBase, 10);
      if (Number.isNaN(v)) throw new CronError(`Invalid value "${part}".`);
      rangeStart = v;
      rangeEnd = v;
    }

    if (rangeStart < min || rangeEnd > max || rangeStart > rangeEnd) {
      throw new CronError(`"${part}" is out of range for this field (expected ${min}-${max}).`);
    }

    for (let v = rangeStart; v <= rangeEnd; v += step) {
      values.add(field === 'dayOfWeek' && v === 7 ? 0 : v);
    }
  }

  return { values };
}

export function parseCron(expression: string): ParsedCron {
  const fields = expression.trim().split(/\s+/);
  if (fields.length !== 5) {
    throw new CronError(`A cron expression needs exactly 5 fields (minute hour day-of-month month day-of-week) — found ${fields.length}.`);
  }

  const [minuteExpr, hourExpr, domExpr, monthExpr, dowExpr] = fields;

  return {
    minute: parseField(minuteExpr, 'minute'),
    hour: parseField(hourExpr, 'hour'),
    dayOfMonth: parseField(domExpr, 'dayOfMonth'),
    month: parseField(monthExpr, 'month'),
    dayOfWeek: parseField(dowExpr, 'dayOfWeek'),
    dayOfMonthIsWildcard: domExpr === '*',
    dayOfWeekIsWildcard: dowExpr === '*'
  };
}

function matchesCron(date: Date, cron: ParsedCron): boolean {
  if (!cron.minute.values.has(date.getMinutes())) return false;
  if (!cron.hour.values.has(date.getHours())) return false;
  if (!cron.month.values.has(date.getMonth() + 1)) return false;

  const domMatch = cron.dayOfMonth.values.has(date.getDate());
  const dowMatch = cron.dayOfWeek.values.has(date.getDay());

  // POSIX cron: when BOTH day-of-month and day-of-week are restricted, a date matches
  // if EITHER matches (OR), not both (AND). A wildcard field imposes no constraint.
  if (cron.dayOfMonthIsWildcard && cron.dayOfWeekIsWildcard) return true;
  if (cron.dayOfMonthIsWildcard) return dowMatch;
  if (cron.dayOfWeekIsWildcard) return domMatch;
  return domMatch || dowMatch;
}

const MAX_MINUTES_TO_SEARCH = 4 * 366 * 24 * 60; // ~4 years

export function getNextRunTimes(cron: ParsedCron, count: number, from: Date = new Date()): Date[] {
  const results: Date[] = [];
  const candidate = new Date(from.getTime());
  candidate.setSeconds(0, 0);
  candidate.setMinutes(candidate.getMinutes() + 1);

  let iterations = 0;
  while (results.length < count && iterations < MAX_MINUTES_TO_SEARCH) {
    iterations++;
    if (matchesCron(candidate, cron)) {
      results.push(new Date(candidate.getTime()));
    }
    candidate.setMinutes(candidate.getMinutes() + 1);
  }

  if (results.length < count) {
    throw new CronError('No matching run times found in the next 4 years — check the expression for an impossible date (e.g. day 31 in a month with 30 days, combined with a fixed month).');
  }

  return results;
}

function describeSet(values: Set<number>, min: number, max: number, labels?: string[]): string {
  const size = max - min + 1;
  if (values.size === size) return 'every';
  const sorted = Array.from(values).sort((a, b) => a - b);
  const names = sorted.map((v) => labels?.[v] ?? String(v));
  return names.join(', ');
}

/** A best-effort plain-language summary. Falls back to a per-field breakdown for complex expressions. */
export function describeCron(cron: ParsedCron): string {
  const isSingle = (f: CronField) => f.values.size === 1;
  const everyDay = cron.dayOfMonthIsWildcard && cron.dayOfWeekIsWildcard;
  const everyMonth = cron.month.values.size === 12;

  if (isSingle(cron.minute) && isSingle(cron.hour) && everyDay && everyMonth) {
    const hh = String([...cron.hour.values][0]).padStart(2, '0');
    const mm = String([...cron.minute.values][0]).padStart(2, '0');
    return `At ${hh}:${mm}, every day.`;
  }

  if (cron.minute.values.size === 60 && cron.hour.values.size === 24 && everyDay && everyMonth) {
    return 'Every minute.';
  }

  const parts = [
    `Minute: ${describeSet(cron.minute.values, 0, 59)}`,
    `Hour: ${describeSet(cron.hour.values, 0, 23)}`,
    `Day of month: ${cron.dayOfMonthIsWildcard ? 'every' : describeSet(cron.dayOfMonth.values, 1, 31)}`,
    `Month: ${describeSet(cron.month.values, 1, 12, ['', ...MONTH_NAMES])}`,
    `Day of week: ${cron.dayOfWeekIsWildcard ? 'every' : describeSet(cron.dayOfWeek.values, 0, 6, [...DOW_NAMES])}`
  ];

  return parts.join(' · ');
}
