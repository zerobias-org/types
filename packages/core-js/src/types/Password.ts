import { StringFormat } from './StringFormat.js';
import { CoreType } from '../CoreType.js';

/**
 * Class representing a password
 */
export class Password extends StringFormat<Password> {
  private static _coreType: ReturnType<typeof CoreType.get> | null = null;

  private static get coreType() {
    if (!Password._coreType) Password._coreType = CoreType.get('password');
    return Password._coreType;
  }

  private password: string;

  constructor(password: string) {
    super();
    this.password = password;
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  static async parse(input: string): Promise<Password> {
    return new Password(input);
  }

  toString(): string {
    return this.password;
  }

  equals(other?: any): boolean {
    return other && other instanceof Password
      ? other.password === this.password
      : false;
  }
}
