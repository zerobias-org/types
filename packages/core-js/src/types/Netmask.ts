import { StringFormat } from './StringFormat.js';
import { InvalidInputError } from '../errors/InvalidInputError.js';
import { CoreType } from '../CoreType.js';

export class Netmask extends StringFormat<Netmask> {
  private static _coreType: ReturnType<typeof CoreType.get> | null = null;

  private static get coreType() {
    if (!Netmask._coreType) Netmask._coreType = CoreType.get('netmask');
    return Netmask._coreType;
  }

  private netmask: string;

  constructor(netmask: string) {
    super();
    this.netmask = Netmask.toNetmask(netmask);
  }

  private static toNetmask(input: string): string {
    if (!input) {
      throw new InvalidInputError('Netmask', input, Netmask.examples());
    }
    if (input.startsWith('/')) {
      return Netmask.fromSlashNotation(input);
    }
    Netmask.validate(input);
    return input;
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  private static validate(input: string): void {
    const split = input.split('.');
    if (split.length !== 4) {
      throw new InvalidInputError('Netmask', input, Netmask.examples());
    }
    for (const group of split) {
      const groupNumValue = Number(group);
      if (Number.isNaN(groupNumValue) || groupNumValue < 0 || groupNumValue > 255) {
        throw new InvalidInputError('Netmask', input, Netmask.examples());
      }
    }
    const binValue = split
      .map((group) => Number(group).toString(2).padStart(8, '0'))
      .join('.');
    if (binValue.indexOf('0') < binValue.lastIndexOf('1')) {
      throw new InvalidInputError('Netmask', input, Netmask.examples());
    }
  }

  private static fromSlashNotation(input: string): string {
    if (!input.startsWith('/')) {
      throw new InvalidInputError('Netmask', input, Netmask.examples());
    }
    const numValue = Number(input.replace('/', ''));
    if (Number.isNaN(numValue) || numValue < 0 || numValue > 24) {
      throw new InvalidInputError('Netmask', input, Netmask.examples());
    }
    let binValue = '00000000.00000000.00000000.00000000';
    for (let i = 0; i < numValue; i++) {
      binValue = binValue.replace('0', '1');
    }
    return binValue
      .split('.')
      .map((group) => Number.parseInt(group, 2))
      .join('.');
  }

  private static toSlashNotation(input: string): string {
    const ones = input
      .split('.')
      .map((group) => Number(group).toString(2))
      .join('')
      .replace(/0/g, '')
      .length;
    return `/${ones}`;
  }

  toString(): string {
    return this.netmask;
  }

  equals(other?: any): boolean {
    return other && other instanceof Netmask
      && other.toString() === this.netmask;
  }

  static async parse(input: string): Promise<Netmask> {
    return new Netmask(input);
  }

  get slashNotation(): string {
    return Netmask.toSlashNotation(this.netmask);
  }
}
