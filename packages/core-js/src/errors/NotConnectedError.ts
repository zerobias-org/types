import { CoreError } from './CoreError.js';
import { NotConnectedError as Model } from '../../generated/model.js';

export class NotConnectedError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.not.connected';

  /**
   * Error indicating a system is not currently connected
   */
  constructor(timestamp = new Date()) {
    super({
      key: NotConnectedError.MESSAGE_KEY,
      template: 'Not connected',
      statusCode: 400,
      timestamp,
    });
    // Set the prototype explicitly - https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, NotConnectedError.prototype);
  }
}
