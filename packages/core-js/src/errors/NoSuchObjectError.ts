import { CoreError } from './CoreError.js';
import { NoSuchObjectError as Model } from '../../generated/model/index.js';

export class NoSuchObjectError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.no.such.object';

  /**
   * Error indicating a specific thing cannot be located
   *
   * @param type - the type of object
   * @param id - the identifier for the object
   * @param timestamp - optional timestamp for the error
   * @param cause - optional original error that caused this error
   */
  constructor(type: string, id: string, timestamp = new Date(), cause?: Error) {
    super({
      key: NoSuchObjectError.MESSAGE_KEY,
      template: 'No such {type}: {id}',
      statusCode: 404,
      timestamp,
      type,
      id,
    }, cause);
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, NoSuchObjectError.prototype);
  }

  get type(): string {
    return this._model.type;
  }

  get id(): string {
    return this._model.id;
  }
}
