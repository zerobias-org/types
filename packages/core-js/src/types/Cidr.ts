import { Address4, Address6 } from 'ip-address';
import { StringFormat } from './StringFormat.js';
import { InvalidInputError } from '../errors/InvalidInputError.js';
import { CoreType } from '../CoreType.js';

const CIDR = 'cidr';

export class Cidr extends StringFormat<Cidr> {
  private cidr!: Address4 | Address6;

  private static _coreType: ReturnType<typeof CoreType.get> | null = null;

  private static get coreType() {
    if (!Cidr._coreType) Cidr._coreType = CoreType.get(CIDR);
    return Cidr._coreType;
  }

  constructor(cidr: string) {
    super();
    this.cidr = Cidr.toCidr(cidr);
  }

  private static toCidr(input: string): Address4 | Address6 {
    if (!input.includes('/')) {
      throw new InvalidInputError(CIDR, 'Subnet was not provided', Cidr.examples());
    }
    let cidr: Address4 | Address6 | undefined;
    if (Address4.isValid(input)) {
      cidr = new Address4(input);
    } else if (Address6.isValid(input)) {
      cidr = new Address6(input);
    }

    if (!cidr) {
      throw new InvalidInputError(
        CIDR,
        'Provided value is neither a valid ipv4 or ipv6 CIDR',
        Cidr.examples()
      );
    }

    return cidr;
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  toString(): string {
    return this.cidr.address;
  }

  equals(other?: any): boolean {
    return other && other instanceof Cidr
            && other.cidr.address === this.cidr.address;
  }

  static async parse(input: string): Promise<Cidr> {
    return new Cidr(input);
  }

  startAddress(): string {
    return this.cidr.startAddress().address;
  }

  endAddress(): string {
    return this.cidr.endAddress().address;
  }

  subnet(): string {
    return this.cidr.subnet;
  }

  mask(): string {
    return this.cidr.mask();
  }

  isInSubnet(input: string): boolean {
    const cidr = Cidr.toCidr(input);
    return this.cidr.isInSubnet(cidr);
  }
}
