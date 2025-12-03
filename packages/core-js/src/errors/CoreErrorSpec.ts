/**
 * Interface describing a CoreError
 */
export interface CoreErrorSpec {

  readonly template: string;
  readonly timestamp: Date;
  readonly key: string;
  readonly statusCode: number

   
  toJSON(): any;

  toString(): string;

  toDebugString(): string;
}
