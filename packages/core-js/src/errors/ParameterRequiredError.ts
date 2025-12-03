import { CoreError } from './CoreError.js';
import { ParameterRequiredError as Model } from '../../generated/model/index.js';

export class ParameterRequiredError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.param.required';

  /**
   * Constructs a new error indicating that a required parameter was not provided to a given operation.
   *
   * @param paramName - The name of the missing parameter
   */
  constructor(paramName: string, timestamp = new Date()) {
    super({
      key: ParameterRequiredError.MESSAGE_KEY,
      template: '{paramName} must be provided',
      statusCode: 400,
      timestamp,
      paramName,
    });
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, ParameterRequiredError.prototype);
  }

  get paramName(): string {
    return this._model.paramName;
  }
}
