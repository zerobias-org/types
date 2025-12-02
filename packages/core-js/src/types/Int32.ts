import { CoreType } from '../CoreType.js';
import { InvalidInputError } from '../errors/index.js';
import { NumberFormat } from './NumberFormat.js';

export const MAX_VALUE = 2147483647;

/**
 * Class representing a 32-bit signed integer
 */
export class Int32 extends NumberFormat<Int32> {
  private static coreType = CoreType.get('int32');

  private value: number;

  constructor(value: number) {
    super();
    const int32Str = String(value);
    const int32 = Number.parseInt(int32Str, 10);
    if (Number.isNaN(int32) || String(int32) !== int32Str) {
      throw new InvalidInputError('int32', int32, Int32.examples());
    }
    if (int32 < -MAX_VALUE || int32 > MAX_VALUE) {
      throw new InvalidInputError('int32', int32, Int32.examples());
    }
    this.value = int32;
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<number> {
    return this.coreType.examples.map((example) => Number(example));
  }

  static async parse(input: number): Promise<Int32> {
    return new Int32(input);
  }

  toString(): string {
    return String(this.value);
  }

  toNumber(): number {
    return this.value;
  }

  equals(other?: any): boolean {
    return other && other instanceof Int32 && other.value === this.value;
  }
}
