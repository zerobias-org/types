import { IPv4CidrRange, IPv6CidrRange, Validator } from 'ip-num';
import { StringFormat } from './StringFormat.js';
import { InvalidInputError } from '../errors/InvalidInputError.js';
import { CoreType } from '../CoreType.js';

const CIDR = 'cidr';

type CidrRange = IPv4CidrRange | IPv6CidrRange;

export class Cidr extends StringFormat<Cidr> {
  private cidr!: CidrRange;

  private _isV4: boolean;

  private _originalInput: string;

  private static _coreType: ReturnType<typeof CoreType.get> | null = null;

  private static get coreType() {
    if (!Cidr._coreType) Cidr._coreType = CoreType.get(CIDR);
    return Cidr._coreType;
  }

  constructor(cidr: string) {
    super();
    const result = Cidr.toCidr(cidr);
    this.cidr = result.range;
    this._isV4 = result.isV4;
    this._originalInput = cidr;
  }

  private static toCidr(input: string): { range: CidrRange; isV4: boolean } {
    if (!input.includes('/')) {
      throw new InvalidInputError(CIDR, 'Subnet was not provided', Cidr.examples());
    }

    // Try IPv4 first
    const [isValidV4] = Validator.isValidIPv4CidrNotation(input);
    if (isValidV4) {
      return { range: IPv4CidrRange.fromCidr(input), isV4: true };
    }

    // Try IPv6
    const [isValidV6] = Validator.isValidIPv6CidrNotation(input);
    if (isValidV6) {
      return { range: IPv6CidrRange.fromCidr(input), isV4: false };
    }

    throw new InvalidInputError(
      CIDR,
      'Provided value is neither a valid ipv4 or ipv6 CIDR',
      Cidr.examples()
    );
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  toString(): string {
    return this.cidr.toCidrString();
  }

  equals(other?: any): boolean {
    return other && other instanceof Cidr
            && other.cidr.toCidrString() === this.cidr.toCidrString();
  }

  static async parse(input: string): Promise<Cidr> {
    return new Cidr(input);
  }

  startAddress(): string {
    const addr = this.cidr.getFirst().toString();
    if (!this._isV4) {
      // Pad IPv6 segments to 4 digits each
      return addr.split(':').map(seg => seg.padStart(4, '0')).join(':');
    }
    return addr;
  }

  endAddress(): string {
    return this.cidr.getLast().toString();
  }

  subnet(): string {
    return `/${this.cidr.getPrefix().getValue()}`;
  }

  mask(): string {
    // Returns the binary representation of the network portion of the address
    const prefix = Number(this.cidr.getPrefix().getValue());
    const firstAddr = this.cidr.getFirst().toString();

    if (this._isV4) {
      // IPv4: convert the network portion octets to binary
      const octets = firstAddr.split('.').map(o => Number.parseInt(o, 10));
      let binary = '';
      for (const octet of octets) {
        binary += octet.toString(2).padStart(8, '0');
      }
      // Return only the network portion (prefix bits)
      return binary.slice(0, Math.max(0, prefix));
    } else {
      // IPv6: convert the network portion segments to binary
      const segments = firstAddr.split(':').map(s => Number.parseInt(s, 16));
      let binary = '';
      for (const segment of segments) {
        binary += segment.toString(2).padStart(16, '0');
      }
      // Return only the network portion (prefix bits)
      return binary.slice(0, Math.max(0, prefix));
    }
  }

  isInSubnet(input: string): boolean {
    const other = Cidr.toCidr(input);
    // Check if this CIDR range is contained within the input range
    return this.cidr.inside(other.range as IPv4CidrRange & IPv6CidrRange);
  }
}
