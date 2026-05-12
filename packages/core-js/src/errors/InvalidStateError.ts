import { CoreError } from './CoreError.js';
import { DateTime } from '../types/DateTime.js';
import { InvalidStateError as Model } from '../../generated/model/index.js';

export class InvalidStateError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.invalid.state';

  /**
   * Generic error for invalid state
   *
   * @param msg - message describing the error
   * @param timestamp - optional timestamp for the error
   * @param cause - optional original error that caused this error
   */
  constructor(msg: string, timestamp: DateTime = new DateTime(new Date()), cause?: Error) {
    super({
      key: InvalidStateError.MESSAGE_KEY,
      template: '{msg}',
      statusCode: 500,
      timestamp,
      msg,
    }, cause);
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, InvalidStateError.prototype);
  }

  get msg(): string {
    return this._model.msg;
  }
}
