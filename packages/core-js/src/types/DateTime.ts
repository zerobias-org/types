import { StringFormat } from './StringFormat.js';
import { InvalidInputError } from '../errors/index.js';
import { CoreType } from '../CoreType.js';

/**
 * Class representing a duration
 */
export class DateTime extends StringFormat<DateTime> {
  private static coreType = CoreType.get('date-time');

  private static pattern = new RegExp(DateTime.coreType.pattern as string);

  private date: Date;

  constructor(date: string | Date) {
    super();
    if (date instanceof Date) {
      this.date = date;
    } else {
      if (!DateTime.pattern.test(date)) {
        throw new InvalidInputError('date-time', date, DateTime.examples());
      }
      try {
        this.date = new Date(date);
      } catch (e) {
        throw new InvalidInputError('date-time', date, DateTime.examples());
      }
    }
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  static async parse(input: string): Promise<DateTime> {
    return new DateTime(input);
  }

  toString(): string {
    return this.date.toISOString();
  }

  equals(other?: any): boolean {
    return other && other instanceof DateTime && other.date === this.date;
  }

  toDate(): Date {
    return this.date;
  }
}
