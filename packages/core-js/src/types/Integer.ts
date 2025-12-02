import { CoreType } from '../CoreType.js';
import { InvalidInputError } from '../errors/index.js';
import { NumberFormat } from './NumberFormat.js';

/**
 * Class representing an integer
 */
export class Integer extends NumberFormat<Integer> {
  private static coreType = CoreType.get('integer');

  private value: number;

  constructor(value: number) {
    super();
    const intStr = String(value);
    const int = Number.parseInt(intStr, 10);
    if (Number.isNaN(int) || String(int) !== intStr) {
      throw new InvalidInputError('integer', int, Integer.examples());
    }
    this.value = int;
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<number> {
    return this.coreType.examples.map((example) => Number(example));
  }

  static async parse(input: number): Promise<Integer> {
    return new Integer(input);
  }

  toString(): string {
    return String(this.value);
  }

  toNumber(): number {
    return this.value;
  }

  equals(other?: any): boolean {
    return other && other instanceof Integer && other.value === this.value;
  }
}
