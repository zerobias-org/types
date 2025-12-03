import { CoreError } from './CoreError.js';
import { TimeoutError as Model } from '../../generated/model/index.js';
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
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }

  get timeout(): Duration {
    return this._model.timeout;
  }
}
