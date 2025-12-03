import { CoreError } from './CoreError.js';
import { UnexpectedError as Model } from '../../generated/model/index.js';

export class UnexpectedError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.unexpected';

  /**
   * Constructs a new error for an unhandled error case
   *
   * @param msg - Generic error message
   */
  constructor(msg: string, statusCode = 500, timestamp = new Date()) {
    super({
      key: UnexpectedError.MESSAGE_KEY,
      template: 'Unexpected error: {msg}',
      statusCode,
      timestamp,
      msg,
    });
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, UnexpectedError.prototype);
  }

  get msg(): string {
    return this._model.msg;
  }
}
