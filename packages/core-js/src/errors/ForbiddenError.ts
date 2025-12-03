import { CoreError } from './CoreError.js';
import { ForbiddenError as Model } from '../../generated/model/index.js';

export class ForbiddenError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.forbidden';

  /**
   * Generic error for illegal arguments
   */
  constructor(timestamp = new Date()) {
    super({
      key: ForbiddenError.MESSAGE_KEY,
      template: 'Forbidden',
      statusCode: 403,
      timestamp,
    });
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
