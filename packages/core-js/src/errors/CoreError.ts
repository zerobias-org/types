import stringify from 'safe-stable-stringify';

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

  private _cause?: Error;

  /**
   * Constructs a new Error Object
   *
   * @param model - the error model containing message key, template, etc.
   * @param cause - optional original error that caused this error (for stack trace preservation)
   */
  constructor(model: T, cause?: Error) {
    super(model.template);
    this._model = model;
    this._cause = cause;
    // Interpolate the template with model values
    this.message = this.interpolateTemplate(model);

    if (model.stack) {
      this.stack = model.stack;
    }

    // Preserve the original error's stack trace by appending it
    if (cause?.stack) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }

  get cause(): Error | undefined {
    return this._cause;
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
   * Coerce any value into a CoreError. Never throws.
   *
   * - CoreError instance → returned unchanged
   * - Object with a registered `key` → rebuilt as the matching subclass
   * - Anything else → wrapped in UnexpectedError, extracting `.message`,
   *   `.timestamp`, and `.stack` from the value when present
   */
  static from(value: unknown): Error & CoreErrorSpec {
    CoreError.ensureInitialized();

    if (value instanceof CoreError) {
      return value as unknown as Error & CoreErrorSpec;
    }

    // If the value has a registered CoreError key, let the library build the subclass.
    // Anything missing/malformed is handled by the try/catch falling through.
    if (value && typeof value === 'object') {
      const o = value as Record<string, unknown>;
      if (typeof o.key === 'string') {
        const keyLibrary = CoreError.errorKeys.get(o.key);
        if (keyLibrary) {
          try {
            return keyLibrary.toError(o);
          } catch {
            // malformed — fall through to UnexpectedError
          }
        }
      }
    }

    // Fallback — wrap in UnexpectedError via whichever library owns that key
    const fallback = CoreError.errorKeys.get('err.unexpected');
    if (!fallback) {
      throw new Error('CoreError not initialized with a library providing UnexpectedError');
    }

    // Best-effort extraction of message/timestamp/stack from a partial error-shaped object
    let msg: string;
    let timestamp = new Date();
    let causeStack: string | undefined;

    if (value instanceof Error) {
      msg = value.message;
      causeStack = value.stack;
    } else if (typeof value === 'string') {
      msg = value;
    } else if (value && typeof value === 'object') {
      const o = value as Record<string, unknown>;
      // Prefer standard .message field over stringifying the whole object
      msg = typeof o.message === 'string'
        ? o.message
        : stringify(value) ?? String(value);
      if (typeof o.timestamp === 'string' || typeof o.timestamp === 'number' || o.timestamp instanceof Date) {
        try {
          const parsed = new Date(o.timestamp);
          if (!Number.isNaN(parsed.getTime())) {
            timestamp = parsed;
          }
        } catch {
          // ignore — keep default timestamp
        }
      }
      if (typeof o.stack === 'string') {
        causeStack = o.stack;
      }
    } else {
      msg = stringify(value) ?? String(value);
    }

    const err = fallback.toError({
      key: 'err.unexpected',
      template: 'Unexpected error: {msg}',
      statusCode: 500,
      timestamp,
      msg,
    });

    // toError() can't accept a cause, so manually chain the stack trace
    if (causeStack) {
      err.stack = `${err.stack}\nCaused by: ${causeStack}`;
    }
    return err;
  }

  /**
   * Deserializes an error out of data which should represent an `ErrorModel`
   * @param data an object which should represent an `ErrorModel`
   */
  static deserialize(data: any): Error & CoreErrorSpec {
    CoreError.ensureInitialized();
    const { key, template, statusCode, timestamp, stack } = data;
    if (!template || !statusCode || !key || !timestamp) {
      throw new Error(data ? stringify(data) : '');
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
