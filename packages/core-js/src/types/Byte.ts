import { StringFormat } from './StringFormat.js';
import { InvalidInputError } from '../errors/index.js';
import { CoreType } from '../CoreType.js';

/**
 * Class representing a base64-encoded byte string
 */
export class Byte extends StringFormat<Byte> {
  private static _coreType: ReturnType<typeof CoreType.get> | null = null;

  private static get coreType() {
    if (!Byte._coreType) Byte._coreType = CoreType.get('byte');
    return Byte._coreType;
  }

  private data: string;

  constructor(data: string) {
    super();
    try {
      // Decode and re-encode to validate base64 format
      // atob/btoa are native in browsers and Node.js 16+
      const decoded = atob(data);
      const encoded = btoa(decoded);
      if (encoded !== data) {
        throw new Error('Invalid base64 encoding');
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
