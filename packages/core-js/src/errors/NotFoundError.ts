import { CoreError } from './CoreError.js';
import { NotFoundError as Model } from '../../generated/model.js';

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
    // Set the prototype explicitly - https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, NotFoundError.prototype);
    this.message = this._model.template
      .replace('{obj}', this.obj);
  }

  get obj(): string {
    return this._model.obj;
  }
}
