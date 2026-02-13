import { CoreError } from './CoreError.js';
import { UnauthorizedError as Model } from '../../generated/model/index.js';

export class UnauthorizedError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.not.authorized';

  /**
   * Generic error for unauthorized access
   *
   * @param timestamp - optional timestamp for the error
   * @param cause - optional original error that caused this error
   */
  constructor(timestamp = new Date(), cause?: Error) {
    super({
      key: UnauthorizedError.MESSAGE_KEY,
      template: 'Not authorized',
      statusCode: 401,
      timestamp,
    }, cause);
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
