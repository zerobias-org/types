import { CoreError } from './CoreError.js';
import { ResultLimitExceededError as Model } from '../../generated/model.js';

export class ResultLimitExceededError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.result.limit.exceeded';

  /**
   * Constructs a new error indicating more results were returned than were requested
   *
   * @param requested - The number of results requested
   * @param returned - The number of results returned
   */
  constructor(requested: number, returned: number, timestamp = new Date()) {
    super({
      key: ResultLimitExceededError.MESSAGE_KEY,
      template: '{requested} results requested but {returned} results returned',
      statusCode: 500,
      timestamp,
      requested,
      returned,
    });
    // Set the prototype explicitly - https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, ResultLimitExceededError.prototype);
    this.message = this._model.template
      .replace('{requested}', this.requested.toString())
      .replace('{returned}', this.returned.toString());
  }

  get requested(): number {
    return this._model.requested;
  }

  get returned(): number {
    return this._model.returned;
  }
}
