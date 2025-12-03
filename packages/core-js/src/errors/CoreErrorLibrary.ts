import { ErrorModel } from './ErrorModel.js';
import { ObjectSerializer } from '../../generated/model/index.js';
import { ErrorLibrary } from '../ErrorLibrary.js';
import { CoreErrorSpec } from './CoreErrorSpec.js';
import { ConflictError } from './ConflictError.js';
import { IllegalArgumentError } from './IllegalArgumentError.js';
import { EulaNotAcceptedError } from './EulaNotAcceptedError.js';
import { ForbiddenError } from './ForbiddenError.js';
import { InvalidCredentialsError } from './InvalidCredentialsError.js';
import { InvalidInputError } from './InvalidInputError.js';
import { InvalidStateError } from './InvalidStateError.js';
import { NoSuchObjectError } from './NoSuchObjectError.js';
import { NotConnectedError } from './NotConnectedError.js';
import { NotFoundError } from './NotFoundError.js';
import { ParameterRequiredError } from './ParameterRequiredError.js';
import { RateLimitExceededError } from './RateLimitExceededError.js';
import { ResultLimitExceededError } from './ResultLimitExceededError.js';
import { TimeoutError } from './TimeoutError.js';
import { UnauthenticatedError } from './UnauthenticatedError.js';
import { UnauthorizedError } from './UnauthorizedError.js';
import { UnexpectedError } from './UnexpectedError.js';

const errorClasses = {
  ConflictError,
  IllegalArgumentError,
  EulaNotAcceptedError,
  ForbiddenError,
  InvalidCredentialsError,
  InvalidInputError,
  InvalidStateError,
  NoSuchObjectError,
  NotConnectedError,
  NotFoundError,
  ParameterRequiredError,
  RateLimitExceededError,
  ResultLimitExceededError,
  TimeoutError,
  UnauthenticatedError,
  UnauthorizedError,
  UnexpectedError,
};

export class CoreErrorLibrary implements ErrorLibrary {
  private lib: typeof errorClasses;

  constructor() {
    this.lib = errorClasses;
  }

  listKeys(): string[] {
    return [
      this.lib.ConflictError.MESSAGE_KEY,
      this.lib.IllegalArgumentError.MESSAGE_KEY,
      this.lib.EulaNotAcceptedError.MESSAGE_KEY,
      this.lib.ForbiddenError.MESSAGE_KEY,
      this.lib.InvalidCredentialsError.MESSAGE_KEY,
      this.lib.InvalidInputError.MESSAGE_KEY,
      this.lib.InvalidStateError.MESSAGE_KEY,
      this.lib.NoSuchObjectError.MESSAGE_KEY,
      this.lib.NotConnectedError.MESSAGE_KEY,
      this.lib.NotFoundError.MESSAGE_KEY,
      this.lib.ParameterRequiredError.MESSAGE_KEY,
      this.lib.RateLimitExceededError.MESSAGE_KEY,
      this.lib.ResultLimitExceededError.MESSAGE_KEY,
      this.lib.TimeoutError.MESSAGE_KEY,
      this.lib.UnauthenticatedError.MESSAGE_KEY,
      this.lib.UnauthorizedError.MESSAGE_KEY,
      this.lib.UnexpectedError.MESSAGE_KEY,
    ];
  }

  toError(data: any): Error & CoreErrorSpec {
    // TODO: this won't return the subclass until my PR @openapi-generator gets merged
    const model = ObjectSerializer.deserialize(data, 'CoreError');
    switch (model.key) {
      case this.lib.ConflictError.MESSAGE_KEY: {
        return new this.lib.ConflictError(model.msg, model.timestamp);
      }
      case this.lib.IllegalArgumentError.MESSAGE_KEY: {
        return new this.lib.IllegalArgumentError(model.msg, model.timestamp);
      }
      case this.lib.EulaNotAcceptedError.MESSAGE_KEY: {
        return new this.lib.EulaNotAcceptedError(model.eulaId, model.timestamp);
      }
      case this.lib.ForbiddenError.MESSAGE_KEY: {
        return new this.lib.ForbiddenError(model.timestamp);
      }
      case this.lib.InvalidCredentialsError.MESSAGE_KEY: {
        return new this.lib.InvalidCredentialsError(model.timestamp);
      }
      case this.lib.InvalidInputError.MESSAGE_KEY: {
         
        return new this.lib.InvalidInputError(model.type, model.value, model.examples, model.timestamp);
      }
      case this.lib.InvalidStateError.MESSAGE_KEY: {
        return new this.lib.InvalidInputError(model.msg, model.timestamp);
      }
      case this.lib.NotConnectedError.MESSAGE_KEY: {
        return new this.lib.NotConnectedError(model.timestamp);
      }
      case this.lib.NotFoundError.MESSAGE_KEY: {
        return new this.lib.NotFoundError(model.obj, model.timestamp);
      }
      case this.lib.NoSuchObjectError.MESSAGE_KEY: {
        return new this.lib.NoSuchObjectError(model.type, model.id, model.timestamp);
      }
      case this.lib.ParameterRequiredError.MESSAGE_KEY: {
        return new this.lib.ParameterRequiredError(model.paramName, model.timestamp);
      }
      case this.lib.RateLimitExceededError.MESSAGE_KEY: {
        return new this.lib.RateLimitExceededError(
          model.timestamp,
          model.callCount,
          model.duration
        );
      }
      case this.lib.ResultLimitExceededError.MESSAGE_KEY: {
         
        return new this.lib.ResultLimitExceededError(model.requested, model.returned, model.timestamp);
      }
      case this.lib.TimeoutError.MESSAGE_KEY: {
        return new this.lib.TimeoutError(model.timeout, model.timestamp);
      }
      case this.lib.UnauthenticatedError.MESSAGE_KEY: {
        return new this.lib.UnauthenticatedError(model.timestamp);
      }
      case this.lib.UnauthorizedError.MESSAGE_KEY: {
        return new this.lib.UnauthorizedError(model.timestamp);
      }
      case this.lib.UnexpectedError.MESSAGE_KEY: {
        return new this.lib.UnexpectedError(model.msg, model.statusCode, model.timestamp);
      }
      default: {
        throw new this.lib.NotFoundError(`error ${model.key}`);
      }
    }
  }

   
  serialize<ModelType extends ErrorModel>(model: ModelType) {
    return ObjectSerializer.serialize(model, 'CoreError');
  }
}
