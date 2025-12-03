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
    return [10, 0.2, -100, 12.101_12, 8_198_171_901, -19_811.829_829_2];
  }

  /**
   * @param input - the input value to parse into an object
   * @returns the given input represented as this type
   */
   
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
   * @returns Method supporting CTF for pg-promise custom type formatting
   */
   
  toPostgres(self: T): any {
    return self.toNumber();
  }
}
