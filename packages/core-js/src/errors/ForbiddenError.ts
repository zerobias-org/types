import { CoreError } from './CoreError.js';
import { ForbiddenError as Model } from '../../generated/model.js';

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
    // Set the prototype explicitly - https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
