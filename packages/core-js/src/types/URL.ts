import * as urllib from 'url/';
import { StringFormat } from './StringFormat.js';
import { InvalidInputError } from '../errors/index.js';
import { CoreType } from '../CoreType.js';

/**
 * Class representing a URL
 */
export class URL extends StringFormat<URL> {
  private static coreType:CoreType = CoreType.get('url');

  private url: urllib.URL;

  readonly relative: boolean;

  readonly _searchParams: URLSearchParams;

  constructor(url: string) {
    super();
    try {
      this.url = urllib.parse(url);
      this.relative = !this.url.protocol;
      this._searchParams = new URLSearchParams(this.url.search);
    } catch (_) {
      throw new InvalidInputError('url', url, URL.examples());
    }
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  static async parse(input: string): Promise<URL> {
    return new URL(input);
  }

  public toString(): string {
    return this.relative
      ? `${this.path}${this.search}${this.hash}`
      : this.url.href;
  }

  equals(other?: any): boolean {
    return other && other instanceof URL
      ? JSON.stringify(other.url) === JSON.stringify(this.url)
      : false;
  }

  get href(): string {
    return this.relative ? this.toString() : this.url.href;
  }

  get origin(): string {
    return this.relative ? '' : `${this.protocol}://${this.host}`;
  }

  get protocol(): string {
    if (this.relative) {
      return '';
    }
    let proto = this.url.protocol;
    if (proto.endsWith(':')) {
      proto = proto.substring(0, proto.length - 1);
    }
    return proto;
  }

  get username(): string {
    return this.relative ? '' : this.url.username;
  }

  get password(): string {
    return this.relative ? '' : this.url.password;
  }

  get host(): string {
    return this.relative ? '' : this.url.host;
  }

  get hostname(): string {
    return this.relative ? '' : this.url.hostname;
  }

  get port(): string {
    return this.relative ? '' : this.url.port;
  }

  get path(): string {
    return this.url.pathname;
  }

  get search(): string {
    return this.url.search || '';
  }

  get searchParams(): URLSearchParams {
    return this._searchParams;
  }

  get hash(): string {
    return this.url.hash || '';
  }
}
