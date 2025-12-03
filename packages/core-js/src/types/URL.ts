import { parse as urlParse, type UrlWithStringQuery } from 'node:url';
import { StringFormat } from './StringFormat.js';
import { InvalidInputError } from '../errors/index.js';
import { CoreType } from '../CoreType.js';

/**
 * Class representing a URL
 */
export class URL extends StringFormat<URL> {
  private static _coreType: ReturnType<typeof CoreType.get> | null = null;

  private static get coreType() {
    if (!URL._coreType) URL._coreType = CoreType.get('url');
    return URL._coreType;
  }

  private url: UrlWithStringQuery;

  readonly relative: boolean;

  readonly _searchParams: URLSearchParams;

  constructor(url: string) {
    super();
    try {
      this.url = urlParse(url);
      this.relative = !this.url.protocol;
      this._searchParams = new URLSearchParams(this.url.search ?? undefined);
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
      : (this.url.href ?? '');
  }

  equals(other?: any): boolean {
    return other && other instanceof URL
      ? JSON.stringify(other.url) === JSON.stringify(this.url)
      : false;
  }

  get href(): string {
    return this.relative ? this.toString() : (this.url.href ?? '');
  }

  get origin(): string {
    return this.relative ? '' : `${this.protocol}://${this.host}`;
  }

  get protocol(): string {
    if (this.relative) {
      return '';
    }
    let proto = this.url.protocol ?? '';
    if (proto.endsWith(':')) {
      proto = proto.slice(0, Math.max(0, proto.length - 1));
    }
    return proto;
  }

  get username(): string {
    return this.relative ? '' : (this.url.auth?.split(':')[0] ?? '');
  }

  get password(): string {
    return this.relative ? '' : (this.url.auth?.split(':')[1] ?? '');
  }

  get host(): string {
    return this.relative ? '' : (this.url.host ?? '');
  }

  get hostname(): string {
    return this.relative ? '' : (this.url.hostname ?? '');
  }

  get port(): string {
    return this.relative ? '' : (this.url.port ?? '');
  }

  get path(): string {
    return this.url.pathname ?? '';
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
