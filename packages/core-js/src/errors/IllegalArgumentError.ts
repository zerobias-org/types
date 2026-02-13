import { CoreError } from './CoreError.js';
import { IllegalArgumentError as Model } from '../../generated/model/index.js';

export class IllegalArgumentError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.illegal.argument';

  /**
   * Generic error for illegal arguments
   *
   * @param msg - message describing the error
   * @param timestamp - optional timestamp for the error
   * @param cause - optional original error that caused this error
   */
  constructor(msg: string, timestamp = new Date(), cause?: Error) {
    super({
      key: IllegalArgumentError.MESSAGE_KEY,
      template: '{msg}',
      statusCode: 400,
      timestamp,
      msg,
    }, cause);
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, IllegalArgumentError.prototype);
  }

  get msg(): string {
    return this._model.msg;
  }
}
