import { CoreError } from './CoreError.js';
import { NotFoundError as Model } from '../../generated/model/index.js';

export class NotFoundError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.not.found';

  /**
   * Error indicating a specific thing cannot be located
   *
   * @param obj - the item which was not found
   * @param timestamp - optional timestamp for the error
   * @param cause - optional original error that caused this error
   */
  constructor(obj: string, timestamp = new Date(), cause?: Error) {
    super({
      key: NotFoundError.MESSAGE_KEY,
      template: 'Not found: {obj}',
      statusCode: 404,
      timestamp,
      obj,
    }, cause);
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  get obj(): string {
    return this._model.obj;
  }
}
