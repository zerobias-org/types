import type { DateTime } from '../types/DateTime.js';

/**
 * Interface describing a CoreError
 */
export interface CoreErrorSpec {

  readonly template: string;
  readonly timestamp: DateTime;
  readonly key: string;
  readonly statusCode: number

   
  toJSON(): any;

  toString(): string;

  toDebugString(): string;
}
