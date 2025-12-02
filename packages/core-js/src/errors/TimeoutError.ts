import { CoreError } from './CoreError.js';
import { TimeoutError as Model } from '../../generated/model.js';
import { Duration } from '../types/Duration.js';

export class TimeoutError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.timeout';

  /**
   * Generic error for illegal arguments
   *
   * @param msg - message describing the error
   */
  constructor(timeout: Duration, timestamp = new Date()) {
    super({
      key: TimeoutError.MESSAGE_KEY,
      template: 'Timeout of {timeout} exceeded',
      statusCode: 500,
      timestamp,
      timeout,
    });
    // Set the prototype explicitly - https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, TimeoutError.prototype);
    this.message = this._model.template
      .replace('{timeout}', this.timeout.toString());
  }

  get timeout(): Duration {
    return this._model.timeout;
  }
}
