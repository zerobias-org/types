/**
 * Model for a serializable error
 */
export interface ErrorModel {
  key: string;
  template: string;
  timestamp: Date;
  statusCode: number;
  stack?: string;
}
