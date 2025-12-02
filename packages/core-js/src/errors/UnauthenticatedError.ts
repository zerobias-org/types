import { CoreError } from './CoreError.js';
import { UnauthenticatedError as Model } from '../../generated/model.js';

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
    // Set the prototype explicitly - https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, UnauthenticatedError.prototype);
  }
}
