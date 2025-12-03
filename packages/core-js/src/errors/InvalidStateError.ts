import { CoreError } from './CoreError.js';
import { InvalidStateError as Model } from '../../generated/model/index.js';

export class InvalidStateError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.invalid.state';

  /**
   * Generic error for illegal arguments
   *
   * @param msg - message describing the error
   */
  constructor(msg: string, timestamp = new Date()) {
    super({
      key: InvalidStateError.MESSAGE_KEY,
      template: '{msg}',
      statusCode: 500,
      timestamp,
      msg,
    });
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, InvalidStateError.prototype);
  }

  get msg(): string {
    return this._model.msg;
  }
}
