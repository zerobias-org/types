import { CoreError } from './CoreError.js';
import { UnauthenticatedError as Model } from '../../generated/model/index.js';

export class UnauthenticatedError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.unable.to.authenticate';

  /**
   * Generic error for unable to authenticate
   */
  constructor(timestamp = new Date()) {
    super({
      key: UnauthenticatedError.MESSAGE_KEY,
      template: 'Unable to authenticate',
      statusCode: 401,
      timestamp,
    });
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, UnauthenticatedError.prototype);
  }
}
