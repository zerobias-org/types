import { createRequire } from 'node:module';
import Phone from 'awesome-phonenumber';
import { StringFormat } from './StringFormat.js';
import { InvalidInputError, NotFoundError } from '../errors/index.js';
import { CoreType } from '../CoreType.js';

const require = createRequire(import.meta.url);
const COUNTRIES = require('@zerobias-org/types-core/data/geo/geoCountries.json');

/**
 * Class representing a phone number
 */
export class PhoneNumber extends StringFormat<PhoneNumber> {
  private static coreType: CoreType = CoreType.get('phoneNumber');

  private phoneNumber: string;

  constructor(phoneNumber: string) {
    super();
    const myPhoneNumber = PhoneNumber.toPhoneNumber(phoneNumber);
    if (!myPhoneNumber) {
      throw new InvalidInputError('phone', phoneNumber, PhoneNumber.examples());
    }
    this.phoneNumber = myPhoneNumber.getNumber();
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

  private static toPhoneNumber(input: string): Phone | null {
    const phoneNumber = new Phone(input);
    return phoneNumber.isValid() ? phoneNumber : null;
  }

  getCountry(): object {
    const phone = PhoneNumber.toPhoneNumber(this.phoneNumber);
    const countryObject = COUNTRIES.find(
      // eslint-disable-next-line max-len
      (country) => country.alpha2?.toLowerCase() === phone?.getRegionCode().toLowerCase()
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
