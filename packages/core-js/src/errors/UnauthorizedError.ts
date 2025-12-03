import { CoreError } from './CoreError.js';
import { UnauthorizedError as Model } from '../../generated/model/index.js';

export class UnauthorizedError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.not.authorized';

  /**
   * Generic error for illegal arguments
   */
  constructor(timestamp = new Date()) {
    super({
      key: UnauthorizedError.MESSAGE_KEY,
      template: 'Not authorized',
      statusCode: 401,
      timestamp,
    });
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
