import { CoreError } from './CoreError.js';
import { NotFoundError as Model } from '../../generated/model/index.js';

export class NotFoundError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.not.found';

  /**
   * Error indicating a specific thing cannot be located
   *
   * @param obj - the item which was not found
   */
  constructor(obj: string, timestamp = new Date()) {
    super({
      key: NotFoundError.MESSAGE_KEY,
      template: 'Not found: {obj}',
      statusCode: 404,
      timestamp,
      obj,
    });
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  get obj(): string {
    return this._model.obj;
  }
}
