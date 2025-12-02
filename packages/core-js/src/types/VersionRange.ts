import * as semver from 'semver';
import { StringFormat } from './StringFormat.js';
import { CoreType } from '../CoreType.js';
import { InvalidInputError } from '../errors/index.js';
import { Semver } from './Semver.js';

const RANGE_TYPE = 'versionRange';

/**
 * Class representing a range of semantic versions
 */
export class VersionRange extends StringFormat<VersionRange> {
  private static coreType: CoreType = CoreType.get(RANGE_TYPE);

  private range: semver.Range;

  private orig: string;

  constructor(range: string) {
    super();
    const r = semver.validRange(range);
    if (!r) {
      throw new InvalidInputError(RANGE_TYPE, range, VersionRange.examples());
    }
    this.range = new semver.Range(r);
    this.orig = range;
  }

  static description(): string {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  static async parse(input: string): Promise<VersionRange> {
    return new VersionRange(input);
  }

  toString(): string {
    return this.orig;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  equals(other?: any): boolean {
    return this.range.toString() === new VersionRange(other.toString()).toString();
  }

  includes(version: Semver): boolean {
    return semver.satisfies(version.toString(), this.range);
  }
}
