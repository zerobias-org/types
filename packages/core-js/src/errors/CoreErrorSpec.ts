/**
 * Interface describing a CoreError
 */
export interface CoreErrorSpec {

  readonly template: string;
  readonly timestamp: Date;
  readonly key: string;
  readonly statusCode: number

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toJSON(): any;

  toString(): string;

  toDebugString(): string;
}
