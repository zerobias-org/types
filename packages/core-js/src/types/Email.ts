import { StringFormat } from './StringFormat.js';
import { InvalidInputError } from '../errors/index.js';
import { CoreType } from '../CoreType.js';

/**
 * Class representing an email
 */
export class Email extends StringFormat<Email> {
  private static coreType = CoreType.get('email');

  private static pattern = new RegExp(Email.coreType.pattern as string);

  private email: string;

  constructor(email: string) {
    super();
    if (!Email.pattern.test(email.toLowerCase())) {
      throw new InvalidInputError('email', email, Email.examples());
    }
    this.email = email.toLowerCase();
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  static async parse(input: string): Promise<Email> {
    return new Email(input);
  }

  toString(): string {
    return this.email;
  }

  equals(other?: any): boolean {
    return other && other instanceof Email && other.email === this.email;
  }
}
