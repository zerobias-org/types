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
  private static _coreType: ReturnType<typeof CoreType.get> | null = null;

  private static get coreType() {
    if (!Duration._coreType) Duration._coreType = CoreType.get('duration');
    return Duration._coreType;
  }

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
    const parts: [string, number | null][] = [
      ['Y', dt.getUTCFullYear() - 1970],
      ['M', dt.getUTCMonth()],
      ['D', dt.getUTCDate() - 1],
      ['T', null],
      ['H', dt.getUTCHours()],
      ['M', dt.getUTCMinutes()],
      ['S', dt.getUTCSeconds()],
    ];
    let str = 'P';
    for (const [k, v] of parts) {
      if (k === 'S') {
        str = `${str}${v}.${dt.getUTCMilliseconds()}${k}`;
      } else if (v !== null && v > 0) {
        str = `${str}${v}${k}`;
      } else if (k === 'T') {
        str = `${str}${k}`;
      }
    }
    return new Duration(str.endsWith('T') ? str.slice(0, -1) : str);
  }

  toString(): string {
    return serializeDuration(this.duration);
  }

  equals(other?: any): boolean {
    return other && other instanceof Duration && other.duration === this.duration;
  }

  getMilliseconds(): number {
    return (this.duration.years || 0) * 31_557_600_000
      + (this.duration.months || 0) * 2_629_800_000 // note: this really should not be static...
      + (this.duration.weeks || 0) * 604_800_000
      + (this.duration.days || 0) * 86_400_000
      + (this.duration.hours || 0) * 3_600_000
      + (this.duration.minutes || 0) * 60_000
      + (this.duration.seconds || 0) * 1000;
  }
}
