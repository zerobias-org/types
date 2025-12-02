import { Address4, Address6 } from 'ip-address';
import { StringFormat } from './StringFormat.js';
import { InvalidInputError } from '../errors/index.js';

import { CoreType } from '../CoreType.js';

/**
 * Class representing an IP address, either v4 or v6
 */
export class IpAddress extends StringFormat<IpAddress> {
  private static coreType:CoreType = CoreType.get('ipAddress');

  ip: Address4 | Address6;

  constructor(ip: string) {
    super();
    const myIp = IpAddress.toIp(ip);
    if (!myIp) {
      throw new InvalidInputError('ip', ip, IpAddress.examples());
    }
    this.ip = myIp;
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  static async parse(input: string): Promise<IpAddress> {
    return new IpAddress(input);
  }

  /**
   * @param input - input to convert to an IP
   * @returns an IPv4 or IPv6 address, if valid. Else, returns `null`
   */
  private static toIp(input: string): Address4 | Address6 | null {
    const ip = new Address4(input);
    if (!ip.isValid()) {
      const ipv6 = new Address6(input);
      return ipv6.isValid() ? ipv6 : null;
    }
    return ip;
  }

  toString(): string {
    return this.ip.address;
  }

  equals(other?: any): boolean {
    return other && other instanceof IpAddress
      ? other.ip.address === this.ip.address
      : false;
  }

  isV4(): boolean {
    return this.ip instanceof Address4;
  }

  isV6(): boolean {
    return this.ip instanceof Address6;
  }
}
