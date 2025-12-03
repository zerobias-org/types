import { ErrorLibrary } from '../ErrorLibrary.js';
import { CoreErrorSpec } from './CoreErrorSpec.js';
import { ErrorModel } from './ErrorModel.js';

/**
 * Base class for well-formed, internationalizable error types.
 * Message keys and interpolation are provided by default.
 * The `message` should be interpolated using arguments wrapped in curlies (i.e. - `{foo}`).
 */
export abstract class CoreError<T extends ErrorModel> extends Error implements CoreErrorSpec {
  private static initialized = false;

  private static errorKeys: Map<string, ErrorLibrary> = new Map();

  protected _model: T;

  /**
   * Constructs a new Error Object
   *
   * @param message - the default message for this error
   * @param key - a unique message key to allow l10n
   * @param statusCode - an HTTP status code to use for this error if it is sent over HTTP
   * @param args - a dictionary of values to interpolate into the message
   */
  constructor(model: T) {
    super(model.template);
    this._model = model;
    // Interpolate the template with model values
    this.message = this.interpolateTemplate(model);
    if (model.stack) {
      this.stack = model.stack;
    }
  }

  /**
   * Interpolates the template string with values from the model.
   * Replaces placeholders like {key} with corresponding model values.
   */
  private interpolateTemplate(model: T): string {
    let message = model.template;
    for (const [key, value] of Object.entries(model)) {
      if (key !== 'template' && key !== 'stack' && value !== undefined) {
        message = message.replace(`{${key}}`, String(value));
      }
    }
    return message;
  }

  /**
   * Registers an error library
   * @param library a library of error keys and types to register
   */
  static register(library: ErrorLibrary): void {
    for (const key of library.listKeys()) {
      if (CoreError.errorKeys.has(key)) {
        throw new Error(`Error ${key} already registered`);
      }
      CoreError.errorKeys.set(key, library);
    }
  }

  /**
   * Initialize the CoreError system. Must be called after all error classes are loaded.
   * This is called automatically by index.ts
   */
  static initWithLibrary(library: ErrorLibrary): void {
    if (!CoreError.initialized) {
      CoreError.register(library);
      CoreError.initialized = true;
    }
  }

  private static ensureInitialized(): void {
    if (!CoreError.initialized) {
      throw new Error('CoreError not initialized. Call CoreError.initWithLibrary() or import from index.js');
    }
  }

  /**
   * Deserializes an error out of data which should represent an `ErrorModel`
   * @param data an object which should represent an `ErrorModel`
   */
  static deserialize(data: any): Error & CoreErrorSpec {
    CoreError.ensureInitialized();
    const { key, template, statusCode, timestamp, stack } = data;
    if (!template || !statusCode || !key || !timestamp) {
      throw new Error(data ? data.toString() : '');
    }

    const library = CoreError.errorKeys.get(key);
    if (!library) {
      throw new Error(`No ErrorLibrary located for ${key}`);
    }
    const err = library.toError(data);
    if (stack) {
      err.stack = stack;
    }
    return err;
  }

  get template(): string {
    return this._model.template;
  }

  get timestamp(): Date {
    return this._model.timestamp;
  }

  get key(): string {
    return this._model.key;
  }

  get statusCode(): number {
    return this._model.statusCode;
  }

   
  toJSON(): any {
    CoreError.ensureInitialized();
    const library = CoreError.errorKeys.get(this.key.toString());
    if (!library) {
      throw new Error(`No ErrorLibrary located for ${this.key}`);
    }
    return {
      ...library.serialize(this._model),
      stack: this.stack,
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }

  toDebugString(): string {
    return JSON.stringify(this.toJSON(), null, 2);
  }
}
