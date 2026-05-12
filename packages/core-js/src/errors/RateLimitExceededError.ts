import { CoreError } from './CoreError.js';
import { DateTime } from '../types/DateTime.js';
import { RateLimitExceededError as Model } from '../../generated/model/index.js';

export class RateLimitExceededError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.rate.limit.exceeded';

  /**
   * Error indicating rate limit has been exceeded
   *
   * @param timestamp - optional timestamp for the error
   * @param callCount - optional number of calls made
   * @param duration - optional duration string
   * @param cause - optional original error that caused this error
   */
  constructor(timestamp: DateTime = new DateTime(new Date()), callCount?: number, duration?: string, cause?: Error) {
    super({
      key: RateLimitExceededError.MESSAGE_KEY,
      template: 'Too many calls',
      statusCode: 429,
      timestamp,
    }, cause);
    if (callCount && duration) {
      this.message = `Too many calls: ${callCount} calls performed in ${duration} duration`;
    }
    Object.setPrototypeOf(this, RateLimitExceededError.prototype);
  }

  get callCount(): number | undefined {
    return this._model.callCount;
  }

  get duration(): string | undefined {
    return this._model.duration;
  }
}
