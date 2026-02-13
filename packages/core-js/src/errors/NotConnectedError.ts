import { CoreError } from './CoreError.js';
import { NotConnectedError as Model } from '../../generated/model/index.js';

export class NotConnectedError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.not.connected';

  /**
   * Error indicating a system is not currently connected
   *
   * @param timestamp - optional timestamp for the error
   * @param cause - optional original error that caused this error
   */
  constructor(timestamp = new Date(), cause?: Error) {
    super({
      key: NotConnectedError.MESSAGE_KEY,
      template: 'Not connected',
      statusCode: 400,
      timestamp,
    }, cause);
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, NotConnectedError.prototype);
  }
}
