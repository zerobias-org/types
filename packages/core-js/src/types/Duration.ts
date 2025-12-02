import {
  parse as parseDuration,
  serialize as serializeDuration,
  Duration as TinyDuration
} from 'tinyduration';
import { StringFormat } from './StringFormat.js';
import { IllegalArgumentError } from '../errors/IllegalArgumentError.js';
import { InvalidInputError } from '../errors/InvalidInputError.js';
import { CoreType } from '../CoreType.js';

/**
 * Class representing a duration
 */
export class Duration extends StringFormat<Duration> {
  private static coreType = CoreType.get('duration');

  private duration: TinyDuration;

  constructor(duration: string) {
    super();
    try {
      this.duration = parseDuration(duration);
    } catch (e) {
      throw new InvalidInputError('duration', duration, Duration.examples());
    }
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  static async parse(input: string): Promise<Duration> {
    return new Duration(input);
  }

  static fromMilliseconds(ms: number): Duration {
    // lifted and modified from https://stackoverflow.com/questions/46633152/convert-milliseconds-to-an-iso-8601-duration
    if (ms < 0) {
      throw new IllegalArgumentError('Duration cannot be negative');
    }
    const dt = new Date(ms);
    const parts = [
      ['Y', dt.getUTCFullYear() - 1970],
      ['M', dt.getUTCMonth()],
      ['D', dt.getUTCDate() - 1],
      ['T', null],
      ['H', dt.getUTCHours()],
      ['M', dt.getUTCMinutes()],
      ['S', dt.getUTCSeconds()],
    ];
    const str = parts.reduce(
      (acc: string, [k, v]) => {
        if (k === 'S') {
          acc = `${acc}${v}.${dt.getUTCMilliseconds()}${k}`;
        } else if (v && v > 0) {
          acc = `${acc}${v}${k}`;
        } else if (k === 'T') {
          acc = `${acc}${k}`;
        }
        return acc;
      },
      'P'
    );
    return new Duration(str.endsWith('T') ? str.slice(0, -1) : str);
  }

  toString(): string {
    return serializeDuration(this.duration);
  }

  equals(other?: any): boolean {
    return other && other instanceof Duration && other.duration === this.duration;
  }

  getMilliseconds(): number {
    return (this.duration.years || 0) * 31557600000
      + (this.duration.months || 0) * 2629800000 // note: this really should not be static...
      + (this.duration.weeks || 0) * 604800000
      + (this.duration.days || 0) * 86400000
      + (this.duration.hours || 0) * 3600000
      + (this.duration.minutes || 0) * 60000
      + (this.duration.seconds || 0) * 1000;
  }
}
