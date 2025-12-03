/**
 * A class representing a rich value for an enumerated object
 */
export class EnumValue {
  private static instanceMap: Record<string, EnumValue> = {};

  /** The key by which this enum value is known */
  readonly key: string | number;

  /** The value for the enum */
  readonly value: string | number;

  /** an optional description of this enum value */
  readonly description?: string;

  private constructor(key: string | number, value: string | number, description?: string) {
    this.key = key;
    this.value = value;
    this.description = description;
  }

  static instance(
    className: string,
    key: string | number,
    value: string | number,
    description?: string
  ): EnumValue {
    const k = `${className}.${key}`;
    if (!EnumValue.instanceMap[k]) {
      EnumValue.instanceMap[k] = new EnumValue(key, value, description);
    }
    return EnumValue.instanceMap[k];
  }

  /**
   * @returns a string representation of this value. To preserve backwards compatibility with TypeScript enums, this returns the value of the enum.
   */
  toString(): string {
    return `${this.value}`;
  }

  /**
   * @returns a string representation of this value. To preserve backwards compatibility with TypeScript enums, this returns the value of the enum.
   */
  toDebugString(): string {
    return `${this.key} [${this.value}${this.description ? ' - ' : ''}${this.description || ''}]`;
  }

  /**
   * @returns Method supporting CTF for pg-promise custom type formatting
   */
  toPostgres(): any {
    return this.value;
  }

  /**
   * @returns the JSON representation of this value, which is `toString`
   */
  toJSON(): any {
    return this.toString();
  }

  eq(other: any): boolean {
    if (!other) {
      return false;
    }
    return this.toString() === other.toString();
  }

  in(...others: any[]): boolean {
    return !!others.find((o) => this.eq(o));
  }
}
