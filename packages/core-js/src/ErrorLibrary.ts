import { CoreErrorSpec } from './errors/CoreErrorSpec.js';
import { ErrorModel } from './errors/ErrorModel.js';

export interface ErrorLibrary {

  /**
   * Lists all the error keys registered in this library
   */
  listKeys(): string[];

  /**
   * Converts an error model into an instance of CoreError
   * @param model the model for the error to convert
   */
  toError(data: any): Error & CoreErrorSpec;

  serialize<ModelType extends ErrorModel>(model: ModelType): any;
}
