import { CoreError } from './CoreError.js';
import { ConflictError as Model } from '../../generated/model.js';

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
    // Set the prototype explicitly - https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, ConflictError.prototype);
    this.message = this._model.template
      .replace('{msg}', this.msg);
  }

  get msg(): string {
    return this._model.msg;
  }
}
