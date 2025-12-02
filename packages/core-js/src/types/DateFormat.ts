import { StringFormat } from './StringFormat.js';
import { InvalidInputError } from '../errors/index.js';
import { CoreType } from '../CoreType.js';

/**
 * Class representing a duration
 */
export class DateFormat extends StringFormat<DateFormat> {
  private static coreType = CoreType.get('date');

  private static pattern = new RegExp(DateFormat.coreType.pattern as string);

  private date: Date;

  constructor(date: string | Date) {
    super();
    if (date instanceof Date) {
      this.date = date;
    } else {
      if (!DateFormat.pattern.test(date)) {
        throw new InvalidInputError('date', date, DateFormat.examples());
      }
      try {
        this.date = new Date(date);
        this.date.setUTCHours(0, 0, 0, 0);
      } catch (e) {
        throw new InvalidInputError('date', date, DateFormat.examples());
      }
    }
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  static async parse(input: string): Promise<DateFormat> {
    return new DateFormat(input);
  }

  toString(): string {
    return this.date.toISOString().slice(0, 10);
  }

  equals(other?: any): boolean {
    return other && other instanceof DateFormat && other.date === this.date;
  }

  toDate(): Date {
    return this.date;
  }
}
