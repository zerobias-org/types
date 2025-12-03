import { CoreError } from './CoreError.js';
import { InvalidCredentialsError as Model } from '../../generated/model/index.js';

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
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
  }
}
