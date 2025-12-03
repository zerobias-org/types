import { CoreError } from './CoreError.js';
import { ResultLimitExceededError as Model } from '../../generated/model/index.js';

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
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, ResultLimitExceededError.prototype);
  }

  get requested(): number {
    return this._model.requested;
  }

  get returned(): number {
    return this._model.returned;
  }
}
