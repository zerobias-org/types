export abstract class NumberFormat<T extends NumberFormat<T>> {
  /**
   * @returns a description of this type
   */
  static description(): string {
    return 'Data type that can be represented as a number';
  }

  /**
   * @returns an array of example inputs for this type
   */
  static examples(): Array<number> {
    return [10, 0.2, -100, 12.10112, 8198171901, -19811.8298292];
  }

  /**
   * @param input - the input value to parse into an object
   * @returns the given input represented as this type
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async parse(input: number): Promise<NumberFormat<any>> {
    throw new Error('unimplemented');
  }

  toJSON(): any {
    return this.toNumber();
  }

  /**
   * @returns A String representation of this object
   */
  abstract toString(): string;

  /**
   * @returns A Number representation of this object
   */
  abstract toNumber(): number;

  /**
   * @param other - another object to compare to
   * @returns true if the other object is equal to this one
   */
  abstract equals(other?: any): boolean;

  /**
   * @returns Method supporting CTF from {@link https://github.com/vitaly-t/pg-promise#custom-type-formatting}. This enables types to be seamlessly utilized in `pg-promise`
   */
  // eslint-disable-next-line class-methods-use-this
  toPostgres(self: T): any {
    return self.toNumber();
  }
}
