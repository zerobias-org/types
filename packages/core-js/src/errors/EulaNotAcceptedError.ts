import { CoreError } from './CoreError.js';
import { EulaNotAcceptedError as Model } from '../../generated/model/index.js';

export class EulaNotAcceptedError extends CoreError<Model> {
  static readonly MESSAGE_KEY = 'err.eula.not.accepted';

  /**
   * Constructs a new error for eula not accepted
   *
   * @param eulaId - ID of the eula that must be accepted
   */
  constructor(eulaId: string, timestamp = new Date()) {
    super({
      key: EulaNotAcceptedError.MESSAGE_KEY,
      template: 'EULA {eulaId} not accepted',
      statusCode: 403,
      timestamp,
      eulaId,
    });
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, EulaNotAcceptedError.prototype);
  }

  get eulaId(): string {
    return this._model.eulaId;
  }
}
