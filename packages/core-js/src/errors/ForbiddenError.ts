import { CoreError } from './CoreError.js';
import { DateTime } from '../types/DateTime.js';
import { ForbiddenError as Model } from '../../generated/model/index.js';

export class ForbiddenError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.forbidden';

  /**
   * Generic error for forbidden access
   *
   * @param timestamp - optional timestamp for the error
   * @param cause - optional original error that caused this error
   */
  constructor(timestamp: DateTime = new DateTime(new Date()), cause?: Error) {
    super({
      key: ForbiddenError.MESSAGE_KEY,
      template: 'Forbidden',
      statusCode: 403,
      timestamp,
    }, cause);
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
