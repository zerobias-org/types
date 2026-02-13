import { CoreError } from './CoreError.js';
import { InvalidCredentialsError as Model } from '../../generated/model/index.js';

export class InvalidCredentialsError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.invalid.credentials';

  /**
   * Generic error for invalid credentials
   *
   * @param timestamp - optional timestamp for the error
   * @param cause - optional original error that caused this error
   */
  constructor(timestamp = new Date(), cause?: Error) {
    super({
      key: InvalidCredentialsError.MESSAGE_KEY,
      template: 'Invalid credentials',
      statusCode: 401,
      timestamp,
    }, cause);
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
  }
}
