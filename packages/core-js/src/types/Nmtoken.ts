import { StringFormat } from './StringFormat.js';
import { InvalidInputError } from '../errors/index.js';
import { CoreType } from '../CoreType.js';

/**
 * Class representing an NMTOKEN
 */
export class Nmtoken extends StringFormat<Nmtoken> {
  private static _coreType: ReturnType<typeof CoreType.get> | null = null;

  private static get coreType() {
    if (!Nmtoken._coreType) Nmtoken._coreType = CoreType.get('nmtoken');
    return Nmtoken._coreType;
  }

  private static _pattern: RegExp | null = null;

  private static get pattern() {
    if (!Nmtoken._pattern) Nmtoken._pattern = new RegExp(Nmtoken.coreType.pattern as string);
    return Nmtoken._pattern;
  }

  private token: string;

  constructor(token: string) {
    super();
    if (!Nmtoken.pattern.test(token)) {
      throw new InvalidInputError('nmtoken', token, Nmtoken.examples());
    }
    this.token = token;
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  static async parse(input: string): Promise<Nmtoken> {
    return new Nmtoken(input);
  }

  toString(): string {
    return this.token;
  }

  equals(other?: any): boolean {
    return other && other instanceof Nmtoken
      ? other.token === this.token
      : false;
  }
}
