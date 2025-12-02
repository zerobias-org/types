import { CoreError } from './CoreError.js';
import { IllegalArgumentError as Model } from '../../generated/model.js';

export class IllegalArgumentError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.illegal.argument';

  /**
   * Generic error for illegal arguments
   *
   * @param msg - message describing the error
   */
  constructor(msg: string, timestamp = new Date()) {
    super({
      key: IllegalArgumentError.MESSAGE_KEY,
      template: '{msg}',
      statusCode: 400,
      timestamp,
      msg,
    });
    // Set the prototype explicitly - https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, IllegalArgumentError.prototype);
    this.message = this._model.template
      .replace('{msg}', this.msg);
  }

  get msg(): string {
    return this._model.msg;
  }
}
