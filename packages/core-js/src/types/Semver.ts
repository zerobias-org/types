import * as semver from 'semver';
import { StringFormat } from './StringFormat.js';
import { CoreType } from '../CoreType.js';
import { InvalidInputError } from '../errors/index.js';

const SEMVER_TYPE = 'semver';
/**
 * Class representing a Semantic Version
 */
export class Semver extends StringFormat<Semver> {
  private static coreType: CoreType = CoreType.get(SEMVER_TYPE);

  private semver!: string;

  constructor(input: string) {
    super();
    const cleanSemver = semver.clean(input, { includePrerelease: true, loose: true });
    if (!cleanSemver) {
      throw new InvalidInputError(SEMVER_TYPE, input, Semver.examples());
    }
    this.semver = cleanSemver;
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  static async parse(input: string): Promise<Semver> {
    return new Semver(input);
  }

  toString(): string {
    return this.semver;
  }

  equals(other?: any): boolean {
    try {
      const otherSemver = new Semver(other.toString());
      return semver.compare(this.semver, otherSemver.semver) === 0;
    } catch (e) {
      return false;
    }
  }

  get major(): number {
    return semver.major(this.semver);
  }

  get minor(): number {
    return semver.minor(this.semver);
  }

  get patch(): number {
    return semver.patch(this.semver);
  }

  gt(input: string | Semver): boolean {
    const v2Input = Semver.toInputString(input);
    return semver.gt(this.semver, v2Input);
  }

  lt(input: string | Semver): boolean {
    const v2Input = Semver.toInputString(input);
    return semver.lt(this.semver, v2Input);
  }

  gte(input: string | Semver): boolean {
    const v2Input = Semver.toInputString(input);
    return semver.gte(this.semver, v2Input);
  }

  lte(input: string | Semver): boolean {
    const v2Input = Semver.toInputString(input);
    return semver.lte(this.semver, v2Input);
  }

  neq(input: string | Semver): boolean {
    const v2Input = Semver.toInputString(input);
    return semver.neq(this.semver, v2Input);
  }

  private static toInputString(input: string | Semver): string {
    return typeof input === 'string'
      ? new Semver(input).toString()
      : input.toString();
  }
}
