import stringify from 'safe-stable-stringify';

import { ErrorLibrary } from '../ErrorLibrary.js';
import { CoreErrorSpec } from './CoreErrorSpec.js';
import { ErrorModel } from './ErrorModel.js';

/**
 * Best-effort parse of a serialized timestamp (ISO string, epoch number, or
 * Date) into a valid Date, or undefined when it can't be parsed.
 */
function parseSerializedTimestamp(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
  return undefined;
}

/**
 * If `value` looks like a serialized `ErrorModel` (string `key` and `template`,
 * numeric `statusCode`, parseable `timestamp`), returns a normalized
 * `ErrorModel` preserving every field; otherwise undefined.
 */
function asSerializedErrorModel(value: unknown): ErrorModel | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }
  const o = value as Record<string, unknown>;
  const timestamp = parseSerializedTimestamp(o.timestamp);
  if (
    typeof o.key === 'string'
    && typeof o.template === 'string'
    && typeof o.statusCode === 'number'
    && timestamp
  ) {
    return { ...o, timestamp } as unknown as ErrorModel;
  }
  return undefined;
}

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
        // replaceAll, not replace — a token may appear more than once in a template
        message = message.replaceAll(`{${key}}`, String(value));
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
   * - Well-formed serialized error whose `key` isn't registered → preserved
   *   verbatim as a {@link GenericCoreError}
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
            // malformed for that library — fall through
          }
        }
      }
      // No library could rebuild it (key unregistered, or its toError threw),
      // but if the value is a well-formed serialized error, preserve it verbatim
      // rather than collapsing to UnexpectedError and losing key/template/status.
      const model = asSerializedErrorModel(o);
      if (model) {
        return new GenericCoreError(model) as unknown as Error & CoreErrorSpec;
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
      // No library for this key in this process — preserve the serialized error
      // as a generic CoreError rather than throwing an internal error that masks
      // the real one. Shape was validated above.
      const model = asSerializedErrorModel(data);
      if (model) {
        return new GenericCoreError(model) as unknown as Error & CoreErrorSpec;
      }
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
    // If no library is registered for this key, fall back to a generic
    // serialisation of the model rather than throwing — toJSON() is typically
    // called from inside an error handler, and a forgotten ErrorLibrary
    // registration shouldn't escalate to a crashed (bodyless 500) response.
    const serialized = library ? library.serialize(this._model) : { ...this._model };
    return {
      ...serialized,
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

/**
 * Concrete {@link CoreError} used when a serialized error's `key` isn't
 * registered with any {@link ErrorLibrary} in the current process. It carries
 * the wire fields (`key`, `template`, `statusCode`, `timestamp`, plus any extra
 * model fields) verbatim, so the error still round-trips with the right status
 * and interpolated message — it just doesn't get a typed subclass's accessors.
 * Produced by {@link CoreError.from} and {@link CoreError.deserialize}.
 */
export class GenericCoreError extends CoreError<ErrorModel> {
  constructor(model: ErrorModel) {
    super(model);
    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, GenericCoreError.prototype);
  }
}
