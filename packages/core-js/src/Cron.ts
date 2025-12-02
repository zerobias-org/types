import { CronExpression as CronParserExpression, parseExpression } from 'cron-parser';
import { CronExpression, DayOfWeek, Month, TimeZoneDef } from '../generated/model.js';

function parseCron(expression: string, tz?: TimeZoneDef): CronParserExpression<false> {
  return parseExpression(expression, {
    tz: tz?.toString(),
    utc: tz === undefined,
  });
}

function parsePart(
  part: Array<string> | Array<number> | string | number | undefined | null
): string {
  if (Array.isArray(part)) {
    return part.map((p) => p.toString()).join(',');
  } if (part !== null && part !== undefined) {
    return part.toString();
  }
  return '*';
}

function parseCronModel(expression: CronExpression, tz?: TimeZoneDef): CronParserExpression {
  const month = Array.isArray(expression.month)
    ? expression.month.map(
      (m) => Month.values.map((mt) => mt.toString())
        .findIndex((mv) => mv.toString() === m.toString()) + 1
    )
    : Month.values.map((mt) => mt.toString())
      .findIndex((mv) => mv.toString() === expression.month?.toString()) + 1;
  const dayOfWeek = Array.isArray(expression.dayOfWeek)
    ? expression.dayOfWeek.map(
      (d) => DayOfWeek.values.map((m) => m.toString())
        .findIndex((dv) => dv.toString() === d.toString())
    )
    : DayOfWeek.values.map((d) => d.toString())
      .findIndex((dv) => dv.toString() === expression.dayOfWeek?.toString());
  const arr: string[] = [
    parsePart(expression.minute),
    parsePart(expression.hour),
    parsePart(expression.dayOfMonth),
    parsePart(
      !Array.isArray(month) && month <= 0 ? expression.month?.toString() : month
    ),
    parsePart(
      !Array.isArray(dayOfWeek) && dayOfWeek <= 0 ? expression.dayOfWeek?.toString() : dayOfWeek
    ),
  ];
  return parseCron(arr.join(' '), tz);
}

export class CronImpl {
  private readonly _cronExpression: CronParserExpression<false>;

  private readonly _cron: CronExpression;

  private readonly _tz?: TimeZoneDef;

  static fromString(expression: string, timeZone?: TimeZoneDef): CronImpl {
    return new CronImpl(expression, timeZone);
  }

  static fromCron(expression: CronExpression, timeZone?: TimeZoneDef): CronImpl {
    return new CronImpl(expression, timeZone);
  }

  constructor(expression: string | CronExpression, timeZone?: TimeZoneDef) {
    if (typeof expression !== 'string') {
      this._cronExpression = parseCronModel(expression, timeZone);
      this._cron = expression;
    } else {
      this._cronExpression = parseCron(expression.toString(), timeZone);
      const { fields } = this._cronExpression;
      this._cron = CronExpression.newInstance({
        minute: fields.minute,
        hour: fields.hour,
        dayOfMonth: fields.dayOfMonth,
        month: fields.month.map((m) => Month[m - 1]),
        dayOfWeek: fields.dayOfWeek.map((d) => DayOfWeek[d]),
      });
    }
    this._tz = timeZone;
  }

  get cron(): CronExpression {
    return this._cron;
  }

  get tz(): TimeZoneDef | undefined {
    return this._tz;
  }

  next(): Date | undefined {
    return this._cronExpression.hasNext()
      ? this._cronExpression.next().toDate()
      : undefined;
  }

  previous(): Date | undefined {
    return this._cronExpression.hasPrev()
      ? this._cronExpression.prev().toDate()
      : undefined;
  }

  toString(): string {
    return this._cronExpression.stringify();
  }
}
