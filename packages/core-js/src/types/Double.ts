import { CoreType } from '../CoreType.js';
import { NumberFormat } from './NumberFormat.js';
import { InvalidInputError } from '../errors/index.js';

/**
 * Class representing a floating-point number with double precision
 */
export class Double extends NumberFormat<Double> {
  private static coreType = CoreType.get('double');

  private value: number;

  constructor(value: number) {
    super();
    if (Number.isNaN(Number(value))) {
      throw new InvalidInputError('double', value, Double.examples());
    }
    this.value = value;
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<number> {
    return this.coreType.examples.map((example) => Number(example));
  }

  static async parse(input: number): Promise<Double> {
    return new Double(input);
  }

  toString(): string {
    return String(this.value);
  }

  toNumber(): number {
    return this.value;
  }

  equals(other?: any): boolean {
    return other && other instanceof Double && other.value === this.value;
  }
}
