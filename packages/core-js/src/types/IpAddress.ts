import { IPv4, IPv6, Validator } from 'ip-num';
import { StringFormat } from './StringFormat.js';
import { InvalidInputError } from '../errors/index.js';

import { CoreType } from '../CoreType.js';

/**
 * Class representing an IP address, either v4 or v6
 */
export class IpAddress extends StringFormat<IpAddress> {
  private static _coreType: ReturnType<typeof CoreType.get> | null = null;

  private static get coreType() {
    if (!IpAddress._coreType) IpAddress._coreType = CoreType.get('ipAddress');
    return IpAddress._coreType;
  }

  ip: IPv4 | IPv6;

  private _isV4: boolean;

  constructor(ip: string) {
    super();
    const result = IpAddress.toIp(ip);
    if (!result) {
      throw new InvalidInputError('ip', ip, IpAddress.examples());
    }
    this.ip = result.ip;
    this._isV4 = result.isV4;
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
   * @returns an IPv4 or IPv6 address with version flag, if valid. Else, returns `null`
   */
  private static toIp(input: string): { ip: IPv4 | IPv6; isV4: boolean } | null {
    const [isValidV4] = Validator.isValidIPv4String(input);
    if (isValidV4) {
      return { ip: new IPv4(input), isV4: true };
    }
    const [isValidV6] = Validator.isValidIPv6String(input);
    if (isValidV6) {
      return { ip: new IPv6(input), isV4: false };
    }
    return null;
  }

  toString(): string {
    return this.ip.toString();
  }

  equals(other?: any): boolean {
    return other && other instanceof IpAddress
      ? other.ip.toString() === this.ip.toString()
      : false;
  }

  isV4(): boolean {
    return this._isV4;
  }

  isV6(): boolean {
    return !this._isV4;
  }
}
