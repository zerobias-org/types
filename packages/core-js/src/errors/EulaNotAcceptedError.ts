import { CoreError } from './CoreError.js';
import { EulaNotAcceptedError as Model } from '../../generated/model.js';

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
    // Set the prototype explicitly - https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, EulaNotAcceptedError.prototype);
    this.message = this._model.template
      .replace('{eulaId}', this.eulaId);
  }

  get eulaId(): string {
    return this._model.eulaId;
  }
}
