import { Buffer } from 'buffer/';
import { StringFormat } from './StringFormat.js';
import { InvalidInputError } from '../errors/index.js';
import { CoreType } from '../CoreType.js';

/**
 * Class representing a duration
 */
export class Byte extends StringFormat<Byte> {
  private static coreType = CoreType.get('byte');

  private data: string;

  constructor(data: string) {
    super();
    try {
      const value = Buffer.from(data, 'base64').toString('binary');
      const encoded = Buffer.from(value, 'binary').toString('base64');
      if (encoded !== data) {
        throw new Error();
      }
      this.data = data;
    } catch (e) {
      throw new InvalidInputError('byte', data, Byte.examples());
    }
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  static async parse(input: string): Promise<Byte> {
    return new Byte(input);
  }

  toString(): string {
    return this.data;
  }

  equals(other?: any): boolean {
    return other && other instanceof Byte && other.data === this.data;
  }
}
