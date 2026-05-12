import { CoreError } from './CoreError.js';
import { DateTime } from '../types/DateTime.js';
import { EulaNotAcceptedError as Model } from '../../generated/model/index.js';

export class EulaNotAcceptedError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.eula.not.accepted';

  /**
   * Constructs a new error for eula not accepted
   *
   * @param eulaId - ID of the eula that must be accepted
   * @param timestamp - optional timestamp for the error
   * @param cause - optional original error that caused this error
   */
  constructor(eulaId: string, timestamp: DateTime = new DateTime(new Date()), cause?: Error) {
    super({
      key: EulaNotAcceptedError.MESSAGE_KEY,
      template: 'EULA {eulaId} not accepted',
      statusCode: 403,
      timestamp,
      eulaId,
    }, cause);
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, EulaNotAcceptedError.prototype);
  }

  get eulaId(): string {
    return this._model.eulaId;
  }
}
