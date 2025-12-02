import { createRequire } from 'node:module';
import { StringFormat } from './StringFormat.js';
import { InvalidInputError, NotFoundError } from '../errors/index.js';
import { CoreType } from '../CoreType.js';

const require = createRequire(import.meta.url);
const MIME_TYPES = require('@zerobias-org/types-core/data/mimeType/mimeTypes.json');

const MIME_TYPE_REGEX = /^[a-z0-9-]+\/[a-z0-9-_+\\. =;/]+(".*")*$/i;

/**
 * Class representing a MIME type
 */

export class MimeType extends StringFormat<MimeType> {
  private static coreType: CoreType = CoreType.get('mimeType');

  private mimeType: string;

  private _name?: string;

  constructor(mimeType: string) {
    super();

    const isValid = MimeType.isValid(mimeType);
    if (!isValid) {
      throw new InvalidInputError('mimeType', mimeType, MimeType.examples());
    }
    this.mimeType = mimeType;
    this._name = MIME_TYPES.find((type) => type.template === this.mimeType)?.name;
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  static async parse(input: string): Promise<MimeType> {
    return new MimeType(input);
  }

  toString(): string {
    return this.mimeType;
  }

  equals(other?: any): boolean {
    return other && other instanceof MimeType && other.toString() === this.mimeType;
  }

  private static isValid(input: string): boolean {
    return !!input.match(MIME_TYPE_REGEX);
  }

  isUnknown(): boolean {
    return this._name === undefined;
  }

  /**
   * Returns the name of the MIME type if it is known or undefined if it is not.
   * When `isUnknown` returns `true`, this method will return `undefined`.
  * */
  getName(): string | undefined {
    return this._name;
  }
}
