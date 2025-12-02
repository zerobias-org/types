import { CoreError } from './CoreError.js';
import { UnauthorizedError as Model } from '../../generated/model.js';

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
    // Set the prototype explicitly - https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
