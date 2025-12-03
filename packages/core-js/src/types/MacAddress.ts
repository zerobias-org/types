import { StringFormat } from './StringFormat.js';
import { InvalidInputError } from '../errors/index.js';
import { CoreType } from '../CoreType.js';

/**
 * Class representing a MAC address
 */
export class MacAddress extends StringFormat<MacAddress> {
  private static _coreType: ReturnType<typeof CoreType.get> | null = null;

  private static get coreType() {
    if (!MacAddress._coreType) MacAddress._coreType = CoreType.get('macAddress');
    return MacAddress._coreType;
  }

  private static _pattern: RegExp | null = null;

  private static get pattern() {
    if (!MacAddress._pattern) MacAddress._pattern = new RegExp(MacAddress.coreType.pattern as string);
    return MacAddress._pattern;
  }

  private token: string;

  constructor(token: string) {
    super();
    if (!MacAddress.pattern.test(token)) {
      throw new InvalidInputError('macAddress', token, MacAddress.examples());
    }
    this.token = token;
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  static async parse(input: string): Promise<MacAddress> {
    return new MacAddress(input);
  }

  /**
   * @returns a random MAC address
   */
  static random(): MacAddress {
    return new MacAddress(
      'XX:XX:XX:XX:XX:XX'.replace(
        /X/g,
        () => '0123456789abcdef'.charAt(Math.floor(Math.random() * 16))
      )
    );
  }

  toString(): string {
    return this.token;
  }

  equals(other?: any): boolean {
    return other?.token === this.token;
  }
}

// Lazy nil instance getter to avoid circular dependency at module load time
let _nil: MacAddress | null = null;
export function getNilMacAddress(): MacAddress {
  if (!_nil) _nil = new MacAddress('00:00:00:00:00:00');
  return _nil;
}
