export abstract class StringFormat<T extends StringFormat<T>> {
  /**
   * @returns a description of this type
   */
  static description(): string {
    return 'Data type that can be represented as a string';
  }

  /**
   * @returns an array of example inputs for this type
   */
  static examples(): Array<string> {
    return ['foo', 'bar', 'baz'];
  }

  /**
   * @param input - the input value to parse into an object
   * @returns the given input represented as this type
   */
   
  static async parse(input: string): Promise<StringFormat<any>> {
    throw new Error('unimplemented');
  }

  toJSON(): any {
    return this.toString();
  }

  /**
   * Matches this string format against the given value.
   * `value`'s form is up to the implementation but generally should be a pattern we can match this instance against.
   * * This does not need to be a valid instance of the type it is matched again, though may be.
   * @param value
   * @returns
   */
   
  matches(value: any): boolean {
    throw new Error('unimplemented');
  }

  /**
   * @returns A String representation of this object
   */
  abstract toString(): string;

  /**
   * @param other - another object to compare to
   * @returns true if the other object is equal to this one
   */
  abstract equals(other?: any): boolean;

  /**
   * @returns Method supporting CTF for pg-promise custom type formatting
   */
   
  toPostgres(self: T): any {
    return self.toString();
  }
}
