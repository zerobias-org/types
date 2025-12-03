import { createRequire } from 'node:module';
import { parsePhoneNumber, type ParsedPhoneNumber } from 'awesome-phonenumber';
import { StringFormat } from './StringFormat.js';
import { InvalidInputError, NotFoundError } from '../errors/index.js';
import { CoreType } from '../CoreType.js';

const require = createRequire(import.meta.url);
const COUNTRIES = require('@zerobias-org/types-core/data/geo/geoCountries.json');

/**
 * Class representing a phone number
 */
export class PhoneNumber extends StringFormat<PhoneNumber> {
  private static _coreType: ReturnType<typeof CoreType.get> | null = null;

  private static get coreType() {
    if (!PhoneNumber._coreType) PhoneNumber._coreType = CoreType.get('phoneNumber');
    return PhoneNumber._coreType;
  }

  private phoneNumber: string;

  constructor(phoneNumber: string) {
    super();
    const parsed = PhoneNumber.toPhoneNumber(phoneNumber);
    if (!parsed) {
      throw new InvalidInputError('phone', phoneNumber, PhoneNumber.examples());
    }
    this.phoneNumber = parsed.number?.e164 ?? phoneNumber;
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  static async parse(input: string): Promise<PhoneNumber> {
    return new PhoneNumber(input);
  }

  private static toPhoneNumber(input: string): ParsedPhoneNumber | null {
    const parsed = parsePhoneNumber(input);
    return parsed.valid ? parsed : null;
  }

  getCountry(): object {
    const parsed = PhoneNumber.toPhoneNumber(this.phoneNumber);
    const countryObject = COUNTRIES.find(
       
      (country: { alpha2?: string }) => country.alpha2?.toLowerCase() === parsed?.regionCode?.toLowerCase()
    );
    if (!countryObject) {
      throw new NotFoundError(`Cannot find country code for ${this.phoneNumber}`);
    }
    return countryObject;
  }

  toString(): string {
    return this.phoneNumber;
  }

  equals(other?: any): boolean {
    return other && other instanceof PhoneNumber && other.phoneNumber === this.phoneNumber;
  }
}
