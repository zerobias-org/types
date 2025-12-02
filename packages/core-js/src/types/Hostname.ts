import { StringFormat } from './StringFormat.js';
import { InvalidInputError } from '../errors/index.js';
import { CoreType } from '../CoreType.js';
import { IpAddress } from './IpAddress.js';

/**
 * Class representing a hostname
 */
export class Hostname extends StringFormat<Hostname> {
  private static coreType: CoreType = CoreType.get('hostname');

  private static pattern = new RegExp(Hostname.coreType.pattern as string);

  private hostname: string;

  constructor(hostname: string) {
    super();
    try {
      // eslint-disable-next-line no-new
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
