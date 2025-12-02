import { CoreType } from '../CoreType.js';
import { NumberFormat } from './NumberFormat.js';
import { InvalidInputError } from '../errors/index.js';

/**
 * Class representing a floating-point number
 */
export class Float extends NumberFormat<Float> {
  private static coreType = CoreType.get('float');

  private value: number;

  constructor(value: number) {
    super();
    if (Number.isNaN(Number(value))) {
      throw new InvalidInputError('float', value, Float.examples());
    }
    this.value = value;
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<number> {
    return this.coreType.examples.map((example) => Number(example));
  }

  static async parse(input: number): Promise<Float> {
    return new Float(input);
  }

  toString(): string {
    return String(this.value);
  }

  toNumber(): number {
    return this.value;
  }

  equals(other?: any): boolean {
    return other && other instanceof Float && other.value === this.value;
  }
}
