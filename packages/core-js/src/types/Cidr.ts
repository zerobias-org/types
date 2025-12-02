import { Address4, Address6 } from 'ip-address';
import { StringFormat } from './StringFormat.js';
import { InvalidInputError } from '../errors/InvalidInputError.js';
import { CoreType } from '../CoreType.js';

const CIDR = 'cidr';

export class Cidr extends StringFormat<Cidr> {
  private cidr!: Address4 | Address6;

  private static coreType: CoreType = CoreType.get(CIDR);

  constructor(cidr: string) {
    super();
    this.cidr = Cidr.toCidr(cidr);
  }

  private static toCidr(input: string): Address4 | Address6 {
    if (!input.includes('/')) {
      throw new InvalidInputError(CIDR, 'Subnet was not provided', Cidr.examples());
    }
    let cidr: Address4 | Address6 | undefined;
    const ipv4: Address4 = new Address4(input);
    if (ipv4.isValid()) {
      cidr = ipv4;
    } else {
      const ipv6 = new Address6(input);
      if (ipv6.isValid()) {
        cidr = ipv6;
      }
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
