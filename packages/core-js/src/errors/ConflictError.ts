import { CoreError } from './CoreError.js';
import { DateTime } from '../types/DateTime.js';
import { ConflictError as Model } from '../../generated/model/index.js';

export class ConflictError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.conflict';

  /**
   * Generic error for conflicting requests.
   *
   * @param msg - message describing the error
   * @param timestamp - optional timestamp for the error
   * @param cause - optional original error that caused this error
   */
  constructor(msg: string, timestamp: DateTime = new DateTime(new Date()), cause?: Error) {
    super({
      key: ConflictError.MESSAGE_KEY,
      template: '{msg}',
      statusCode: 409,
      timestamp,
      msg,
    }, cause);
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, ConflictError.prototype);
  }

  get msg(): string {
    return this._model.msg;
  }
}
