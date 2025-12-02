import { CoreError } from './CoreError.js';
import { ParameterRequiredError as Model } from '../../generated/model.js';

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
    // Set the prototype explicitly - https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, ParameterRequiredError.prototype);
    this.message = this._model.template
      .replace('{paramName}', this.paramName);
  }

  get paramName(): string {
    return this._model.paramName;
  }
}
