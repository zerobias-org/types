import { StringFormat } from './StringFormat.js';
import { InvalidInputError } from '../errors/index.js';
import { CoreType } from '../CoreType.js';

// Dummy base for parsing relative URLs - only path/search/hash are used
const RELATIVE_BASE = 'http://relative.invalid';

/**
 * Class representing a URL
 * Uses native URL API for browser compatibility (no polyfills needed)
 */
export class URL extends StringFormat<URL> {
  private static _coreType: ReturnType<typeof CoreType.get> | null = null;

  private static get coreType() {
    if (!URL._coreType) URL._coreType = CoreType.get('url');
    return URL._coreType;
  }

  private url: globalThis.URL;

  readonly relative: boolean;

  readonly _searchParams: URLSearchParams;

  // Track if relative URL had leading slash (native URL normalizes by adding one)
  private readonly _hadLeadingSlash: boolean;

  constructor(url: string) {
    super();
    try {
      // Check if URL has a protocol (absolute) or is relative
      const hasProtocol = /^[a-z][a-z0-9+.-]*:/i.test(url);

      if (hasProtocol) {
        this.url = new globalThis.URL(url);
        this.relative = false;
        this._hadLeadingSlash = true;
      } else {
        // Track if original had leading slash before native URL normalizes it
        this._hadLeadingSlash = url.startsWith('/');
        // Use dummy base for relative URLs - we only need path/search/hash
        this.url = new globalThis.URL(url, RELATIVE_BASE);
        this.relative = true;
      }

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
    return this.relative ? '' : (this.url.username ?? '');
  }

  get password(): string {
    return this.relative ? '' : (this.url.password ?? '');
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
    const pathname = this.url.pathname ?? '';
    // Strip leading slash if original relative URL didn't have one
    if (this.relative && !this._hadLeadingSlash && pathname.startsWith('/')) {
      return pathname.slice(1);
    }
    return pathname;
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
