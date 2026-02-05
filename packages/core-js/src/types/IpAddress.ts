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
   * Extracts the embedded IPv4 address from various IPv6 formats.
   * Handles:
   * - ::ffff:127.0.0.1 (IPv4-mapped, dotted notation)
   * - ::127.0.0.1 (IPv4-compatible, dotted notation)
   * - 0:0:0:0:0:ffff:127.0.0.1 (IPv4-mapped, full form)
   * - ::ffff:7f00:1 (IPv4-mapped, hex notation - 127.0.0.1)
   * - 0:0:0:0:0:ffff:7f00:1 (IPv4-mapped, full hex form)
   * @returns the IPv4 string if found, null otherwise
   */
  private static extractEmbeddedIPv4(input: string): string | null {
    // Dotted notation: ::ffff:127.0.0.1 or ::127.0.0.1 or full form 0:0:0:0:0:ffff:127.0.0.1
    const dottedMatch = input.match(/^(?:0:){0,5}(?:0:|f{4}:)?((?:\d{1,3}\.){3}\d{1,3})$/i)
      || input.match(/^:{2}(?:f{4}:)?((?:\d{1,3}\.){3}\d{1,3})$/i);
    if (dottedMatch) {
      return dottedMatch[1];
    }

    // Hex notation: ::ffff:7f00:1 or 0:0:0:0:0:ffff:7f00:1 (last two segments are IPv4 in hex)
    const hexMappedMatch = input.match(/^(?:0:){0,5}f{4}:([\da-f]{1,4}):([\da-f]{1,4})$/i)
      || input.match(/^::ffff:([\da-f]{1,4}):([\da-f]{1,4})$/i);
    if (hexMappedMatch) {
      const high = Number.parseInt(hexMappedMatch[1], 16);
      const low = Number.parseInt(hexMappedMatch[2], 16);
      // Convert two 16-bit values to four 8-bit octets
      const o1 = (high >> 8) & 0xFF;
      const o2 = high & 0xFF;
      const o3 = (low >> 8) & 0xFF;
      const o4 = low & 0xFF;
      return `${o1}.${o2}.${o3}.${o4}`;
    }

    return null;
  }

  /**
   * Strips the zone ID from an IPv6 address (e.g., fe80::1%eth0 -> fe80::1)
   */
  private static stripZoneId(input: string): string {
    const zoneIndex = input.indexOf('%');
    return zoneIndex === -1 ? input : input.slice(0, Math.max(0, zoneIndex));
  }

  /**
   * @param input - input to convert to an IP
   * @returns an IPv4 or IPv6 address with version flag, if valid. Else, returns `null`
   */
  private static toIp(input: string): { ip: IPv4 | IPv6; isV4: boolean } | null {
    // First check for pure IPv4
    const [isValidV4] = Validator.isValidIPv4String(input);
    if (isValidV4) {
      return { ip: new IPv4(input), isV4: true };
    }

    // Check for embedded IPv4 in IPv6 format
    const embeddedV4 = IpAddress.extractEmbeddedIPv4(input);
    if (embeddedV4) {
      const [isValidEmbedded] = Validator.isValidIPv4String(embeddedV4);
      if (isValidEmbedded) {
        return { ip: new IPv4(embeddedV4), isV4: true };
      }
    }

    // Strip zone ID for IPv6 validation (e.g., fe80::1%eth0)
    const strippedInput = IpAddress.stripZoneId(input);
    const [isValidV6] = Validator.isValidIPv6String(strippedInput);
    if (isValidV6) {
      return { ip: new IPv6(strippedInput), isV4: false };
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
