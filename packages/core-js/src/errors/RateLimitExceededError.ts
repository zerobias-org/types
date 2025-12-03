import { CoreError } from './CoreError.js';
import { RateLimitExceededError as Model } from '../../generated/model/index.js';

export class RateLimitExceededError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.rate.limit.exceeded';

  constructor(timestamp = new Date(), callCount?: number, duration?: string) {
    super({
      key: RateLimitExceededError.MESSAGE_KEY,
      template: 'Too many calls',
      statusCode: 429,
      timestamp,
    });
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
