import { CoreError } from './CoreError.js';
import { InvalidCredentialsError as Model } from '../../generated/model.js';

export class InvalidCredentialsError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.invalid.credentials';

  /**
   * Generic error for illegal arguments
   */
  constructor(timestamp = new Date()) {
    super({
      key: InvalidCredentialsError.MESSAGE_KEY,
      template: 'Invalid credentials',
      statusCode: 401,
      timestamp,
    });
    // Set the prototype explicitly - https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
  }
}
