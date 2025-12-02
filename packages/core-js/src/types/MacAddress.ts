import { StringFormat } from './StringFormat.js';
import { InvalidInputError } from '../errors/index.js';
import { CoreType } from '../CoreType.js';

/**
 * Class representing a MAC address
 */
export class MacAddress extends StringFormat<MacAddress> {
  private static coreType: CoreType = CoreType.get('macAddress');

  private static pattern = new RegExp(MacAddress.coreType.pattern as string);

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

export const nil = new MacAddress('00:00:00:00:00:00');
