import { CoreType } from '../CoreType.js';
import { InvalidInputError } from '../errors/index.js';
import { NumberFormat } from './NumberFormat.js';

/**
 * Class representing a 64-bit signed integer
 */
export class Int64 extends NumberFormat<Int64> {
  private static coreType = CoreType.get('int64');

  private value: number;

  constructor(value: number) {
    super();
    const int64Str = String(value);
    const int64 = Number.parseInt(int64Str, 10);
    if (Number.isNaN(int64) || String(int64) !== int64Str) {
      throw new InvalidInputError('int64', int64, Int64.examples());
    }
    if (int64 < Number.MIN_SAFE_INTEGER || int64 > Number.MAX_SAFE_INTEGER) {
      throw new InvalidInputError('int64', int64, Int64.examples());
    }
    this.value = int64;
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<number> {
    return this.coreType.examples.map((example) => Number(example));
  }

  static async parse(input: number): Promise<Int64> {
    return new Int64(input);
  }

  toString(): string {
    return String(this.value);
  }

  toNumber(): number {
    return this.value;
  }

  equals(other?: any): boolean {
    return other && other instanceof Int64 && other.value === this.value;
  }
}
