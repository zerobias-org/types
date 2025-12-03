import { CoreError } from './CoreError.js';
import { InvalidInputError as Model } from '../../generated/model/index.js';

export class InvalidInputError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.invalid.input';

  /**
   * Constructs a new error indicating that a given input is invalid
   *
   * @param type - the type of the invalid input
   * @param value - the input value provided
   * @param examples - some examples of expected inputs
   */
  constructor(
    type: string,
    value: any,
    examples: Array<string | number> = [],
    timestamp = new Date()
  ) {
    super({
      key: InvalidInputError.MESSAGE_KEY,
      template: 'Invalid {type}: {value}',
      statusCode: 400,
      timestamp,
      type,
      value,
      examples: examples.map((v: string | number) => v.toString()),
    });
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, InvalidInputError.prototype);
  }

  get type(): string {
    return this._model.type;
  }

  get value(): string {
    return this._model.value;
  }
}
