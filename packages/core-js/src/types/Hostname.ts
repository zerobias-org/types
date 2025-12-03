import { StringFormat } from './StringFormat.js';
import { InvalidInputError } from '../errors/index.js';
import { CoreType } from '../CoreType.js';
import { IpAddress } from './IpAddress.js';

/**
 * Class representing a hostname
 */
export class Hostname extends StringFormat<Hostname> {
  private static _coreType: ReturnType<typeof CoreType.get> | null = null;

  private static get coreType() {
    if (!Hostname._coreType) Hostname._coreType = CoreType.get('hostname');
    return Hostname._coreType;
  }

  private static _pattern: RegExp | null = null;

  private static get pattern() {
    if (!Hostname._pattern) Hostname._pattern = new RegExp(Hostname.coreType.pattern as string);
    return Hostname._pattern;
  }

  private hostname: string;

  constructor(hostname: string) {
    super();
    try {
       
      new IpAddress(hostname);
      throw new InvalidInputError('hostname', hostname, Hostname.examples());
    } catch (e) {
      // not an IP - that's fine
    }
    if (!Hostname.pattern.test(hostname)) {
      throw new InvalidInputError('hostname', hostname, Hostname.examples());
    }
    this.hostname = hostname;
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  static async parse(input: string): Promise<Hostname> {
    return new Hostname(input);
  }

  toString(): string {
    return this.hostname;
  }

  equals(other?: any): boolean {
    return other && other instanceof Hostname
      ? other.hostname === this.hostname
      : false;
  }
}
