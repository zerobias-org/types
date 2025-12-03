import { CoreError } from './CoreError.js';
import { ConflictError as Model } from '../../generated/model/index.js';

export class ConflictError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.conflict';

  /**
   * Generic error for conflicting requests.
   *
   * @param msg - message describing the error
   */
  constructor(msg: string, timestamp = new Date()) {
    super({
      key: ConflictError.MESSAGE_KEY,
      template: '{msg}',
      statusCode: 409,
      timestamp,
      msg,
    });
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, ConflictError.prototype);
  }

  get msg(): string {
    return this._model.msg;
  }
}
