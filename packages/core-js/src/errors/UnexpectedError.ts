import { CoreError } from './CoreError.js';
import { UnexpectedError as Model } from '../../generated/model.js';

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
    // Set the prototype explicitly - https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, UnexpectedError.prototype);
    this.message = this._model.template
      .replace('{msg}', this.msg);
  }

  get msg(): string {
    return this._model.msg;
  }
}
