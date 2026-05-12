import { CoreError } from './CoreError.js';
import { DateTime } from '../types/DateTime.js';
import { TimeoutError as Model } from '../../generated/model/index.js';
import { Duration } from '../types/Duration.js';

export class TimeoutError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.timeout';

  /**
   * Error indicating a timeout has occurred
   *
   * @param timeout - the duration that was exceeded
   * @param timestamp - optional timestamp for the error
   * @param cause - optional original error that caused this error
   */
  constructor(timeout: Duration, timestamp: DateTime = new DateTime(new Date()), cause?: Error) {
    super({
      key: TimeoutError.MESSAGE_KEY,
      template: 'Timeout of {timeout} exceeded',
      statusCode: 500,
      timestamp,
      timeout,
    }, cause);
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }

  get timeout(): Duration {
    return this._model.timeout;
  }
}
