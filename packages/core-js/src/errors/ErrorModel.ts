import type { DateTime } from '../types/DateTime.js';

/**
 * Model for a serializable error
 */
export interface ErrorModel {
  key: string;
  template: string;
  timestamp: DateTime;
  statusCode: number;
  stack?: string;
}
