import pLimit from 'p-limit';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  IllegalArgumentError,
  InvalidInputError,
  InvalidStateError,
  ResultLimitExceededError,
  UnexpectedError
} from './errors/index.js';
import { URL } from './types/URL.js';
import { Nmtoken } from './types/Nmtoken.js';
import { UUID } from './types/UUID.js';
import { HttpMethod, SortDirectionDef } from '../generated/model/index.js';

export enum PagedResultsColumnOptionsFilterType {
  String = 'string',
  Resource = 'resource',
  Tag = 'tag',
  Custom = 'custom'
}

export interface PagedResultsColumnOptionsFilterDef {
  type: PagedResultsColumnOptionsFilterType,
  multi: boolean,
  options: string[] | {
    id: UUID,
    name: string,
    description?: string,
    imageUrl?: URL,
  }[] | {
    id: UUID,
    name: string,
    description?: string,
    ownerId: UUID,
    type: Nmtoken,
    typeDescription?: string,
    color?: string,
  }[] | {
    id: UUID,
    name: string,
    customFields?: Record<string, any>,
  }[]
}

export interface PagedResultsColumnOptionsDef {
  sortable: boolean,
  searchable: boolean,
  filterable: boolean,
  filter?: PagedResultsColumnOptionsFilterDef,
}

export interface PagedResultsSearchColumnOptionsDef {
  searchOptions: string[] | {
    id: UUID,
    name: string,
    description?: string,
    imageUrl?: URL,
  }[] | {
    id: UUID,
    name: string,
    description?: string,
    ownerId: UUID,
    type: Nmtoken,
    typeDescription?: string,
    color?: string,
  }[] | {
    id: UUID,
    name: string,
    customFields?: Record<string, any>,
  }[]
}

const axiosReal = axios.create({
  validateStatus: () => true,
  withCredentials: true,
});

/**
 * Pagination mode for PagedResults
 * - 'auto': Automatically detect from API response (default)
 * - 'cursor': Use cursor-based pagination with pageToken
 * - 'offset': Use offset-based pagination with pageNumber
 */
export type PaginationMode = 'auto' | 'cursor' | 'offset';

type PaginationContractCommon = {
  /**
   * Param name used for page size in the outgoing request. Defaults to
   * 'per_page'. Override for vendors that use a different name (e.g. 'limit',
   * 'page_size'). Set to empty string to omit page-size entirely.
   */
  pageSizeParam?: string,
};

/**
 * Cursor query-param hint for `link-header-next`. Common values are listed
 * for autocomplete; any string is accepted at runtime.
 *
 * Note: when using `link-header-next`, callers must set
 * `paginationMode = 'cursor'` explicitly (not the default 'auto') for
 * `consumeResponse` to extract the next-page cursor. Auto/offset mode skips
 * cursor extraction and parses rel="last" for a count estimate instead.
 */
export type CursorParamHint = 'after' | 'before' | 'cursor' | (string & Record<never, never>);

/**
 * Vendor-pagination contract describing how to translate between a vendor API
 * and a PagedResults instance. Used by `applyToRequest` and `consumeResponse`
 * so each module declares its pagination shape once instead of hand-writing
 * Link-header / cursor-extraction logic per call site.
 *
 * Variants:
 * - `link-header-next`: vendor returns Link header with rel="next"; cursor is
 *   a query param on the next URL (GitHub Dependabot, GitLab, Atlassian).
 * - `body-token`: vendor returns next-page cursor as a field in the response
 *   body, addressed by dotted path (AWS NextToken, HubSpot paging.next.after,
 *   Slack response_metadata.next_cursor, Box next_marker).
 * - `body-url`: vendor returns full next-page URL in the response body
 *   (Microsoft Graph @odata.nextLink). Caller is expected to re-issue against
 *   the URL directly; cursor is the URL itself stored in pageToken.
 * - `header-token`: vendor returns next-page cursor in a custom HTTP header.
 * - `page-number`: legacy offset pagination via numeric page param.
 */
export type PaginationContract = PaginationContractCommon & (
  | { kind: 'link-header-next', cursorParam?: CursorParamHint }
  | { kind: 'body-token', tokenPath: string }
  | { kind: 'body-url', urlPath: string }
  | { kind: 'header-token', headerName: string }
  | { kind: 'page-number' }
);

/**
 * Parses an RFC 5988 Link header into a `{ rel: url }` map. Tolerates extra
 * whitespace, missing rel, malformed segments (skipped silently). The URL
 * inside `<>` can legitimately contain commas, so we match link-values
 * directly with a global regex rather than splitting on `,` first.
 */
export function parseLinkHeader(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  const re = /<([^>]+)>\s*;\s*rel\s*=\s*"?([^\s",;]+)"?/g;
  let match: RegExpExecArray | null = re.exec(header);
  while (match !== null) {
    out[match[2]] = match[1];
    match = re.exec(header);
  }
  return out;
}

/**
 * Extracts a cursor query param from a paginated next-page URL. If
 * `preferred` is supplied and present in the URL, returns its value. Otherwise
 * falls back to `after`, `before`, then `cursor` (in that order). Returns
 * undefined for unparseable URLs or when no candidate is present.
 */
export function extractCursorParam(url: string, preferred?: string): string | undefined {
  try {
    const u = new globalThis.URL(url);
    if (preferred) {
      const direct = u.searchParams.get(preferred);
      if (direct != null) return direct;
    }
    return (
      u.searchParams.get('after')
      ?? u.searchParams.get('before')
      ?? u.searchParams.get('cursor')
      ?? undefined
    );
  } catch {
    return undefined;
  }
}

/**
 * Reads a value from a nested object via a dotted path. Tries the literal
 * key first (e.g. Microsoft Graph's `@odata.nextLink` is one key with a dot
 * in the name), then falls back to dotted-path traversal. Returns undefined
 * if neither resolves.
 */
export function readPath(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  if (typeof obj === 'object' && obj[path] !== undefined) {
    return obj[path];
  }
  const segments = path.split('.');
  let cur: any = obj;
  for (const seg of segments) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[seg];
  }
  return cur;
}

/**
 * Builds a stable, low-cost fingerprint for an array of items so two
 * consecutive pages can be compared for equality without deep-stringifying
 * the whole payload. Uses up to the first 3 items and looks for common
 * stable id keys (`id`, `number`, `uuid`, `_id`, `name`) on object items;
 * primitive items are fingerprinted directly. Returns undefined when the
 * array is empty OR when any object item lacks a recognizable id — in that
 * case duplicate detection silently skips this comparison rather than risk a
 * false positive from a brittle JSON-truncation fallback. Callers that need
 * detection on opaque items should add a stable id field to their items.
 */
export function pageFingerprint(items: any[]): string | undefined {
  if (!items || items.length === 0) return undefined;
  // Case-insensitive lookup so we catch AWS-style `Name`/`Id`/`Arn` and
  // PascalCase variants without forcing callers to lowercase keys.
  const idKeys = ['id', 'number', 'uuid', '_id', 'name', 'arn'];
  const head = items.slice(0, 3);
  const ids: string[] = [];
  let anyStamped = false;
  for (const item of head) {
    if (item == null) {
      ids.push('null');
      continue;
    }
    if (typeof item !== 'object') {
      ids.push(`p:${String(item)}`);
      anyStamped = true;
      continue;
    }
    const lowerKeyMap: Record<string, string> = {};
    for (const k of Object.keys(item)) {
      lowerKeyMap[k.toLowerCase()] = k;
    }
    let stamped = false;
    for (const target of idKeys) {
      const realKey = lowerKeyMap[target];
      if (realKey === undefined) continue;
      const v = item[realKey];
      if (v !== undefined && v !== null) {
        ids.push(`${target}:${String(v)}`);
        stamped = true;
        anyStamped = true;
        break;
      }
    }
    if (!stamped) {
      // Opaque object — bail out rather than risk a false positive.
      return undefined;
    }
  }
  if (!anyStamped) return undefined;
  return `${items.length}|${ids.join('|')}`;
}

/**
 * Writes a value to a nested object via a dotted path, creating intermediate
 * objects as needed. Throws InvalidStateError if a path segment encounters a
 * pre-existing non-null primitive (so callers don't silently destroy adjacent
 * data when a path conflicts with caller-supplied options).
 */
export function writePath(obj: Record<string, any>, path: string, value: any): void {
  if (!path) return;
  const segments = path.split('.');
  let cur: Record<string, any> = obj;
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i];
    if (cur[seg] == null) {
      cur[seg] = {};
    } else if (typeof cur[seg] !== 'object') {
      throw new InvalidStateError(
        `writePath: cannot traverse path '${path}' — segment '${seg}' is a ${typeof cur[seg]}, not an object`
      );
    }
    cur = cur[seg];
  }
  const tail = segments.at(-1);
  if (tail !== undefined) {
    cur[tail] = value;
  }
}

/**
* Wrapper for a response with a paged result set.
*/
export class PagedResults<T> {
  /**
   * Total number of items available in the result set, if available.
   */
  private _count?: number = undefined;

  /**
   * The total number of pages available, if available.
   */
  private _pageCount?: number = undefined;

  /**
   * The index of the current page (1-indexed)
   */
  private _pageNumber = 1;

  /**
   * The number of items in each page
   */
  private _pageSize = 50;

  /**
   * Array of columns to sort by
   */
  private _sortBy: string[] = [];

  /**
   * Array of directions to sort by
   */
  private _sortDir: SortDirectionDef[] = [];

  /**
   * Map of result columns returned with sort/search/filter availability
   */
  private _columnOptions: Record<string, PagedResultsColumnOptionsDef> = {};

  /**
   * Map of results from search columns returned with filter availability
   */
  private _searchColumnOptions: Record<string, PagedResultsSearchColumnOptionsDef> = {};

  /**
   * The token to retrieve the next page, if present
   */
  pageToken?: string = undefined;

  /**
   * Pagination mode: 'auto' (detect from response), 'cursor', or 'offset'.
   * When 'auto', the mode is detected from the first API response based on
   * whether a pageToken is returned in headers or response body.
   */
  paginationMode: PaginationMode = 'auto';

  /**
   * Detected pagination mode after first API response (internal use).
   * This is set automatically when paginationMode is 'auto'.
   */
  private _detectedMode?: 'cursor' | 'offset';

  /**
   * The items included in this page
   */
  private _items: Array<T> = [];

  /** The URL where this page was fetched from. This enables fetching additional pages */
  baseUrl?: URL;

  /**
   * The HTTP Method to use when fetching pages. Defaults to `GET`. If it is a `POST` or `PUT`,
   * pagination parameters will be provided in the body rather than query
   */
  httpMethod = HttpMethod.Get;

  /**
   * HTTP request headers to send when fetching pages
   */
  headers = {};

  /**
   * HTTP request parameters to send when fetching pages
   */
  params = {};

  /**
   * HTTP request body if the httpMethod is not `GET`. This will be augmented with the
   * pagination parameters
   */
  body = {};

  /** An object mapper for the type of objects in this collection */
  mapper?: (obj: any) => T;

  /**
   * Maximum number of remote pages `asyncGenerator()` will fetch before
   * aborting with `UnexpectedError`. Defends against infinite-loop bugs where
   * a vendor returns the same page repeatedly (e.g. cursor not advancing).
   * Defaults to 1000; set to 0 to disable.
   */
  maxPages = 1000;

  /**
   * When true (default), `asyncGenerator()` aborts with `UnexpectedError` if
   * two consecutive remote pages return identical first-item shallow-keys,
   * which indicates a stuck cursor / non-advancing offset.
   */
  detectDuplicatePages = true;

  get count(): number | undefined {
    return this._count;
  }

  set count(count: number | undefined) {
    this._count = count;
    this.calculatePageCount();
  }

  get pageCount(): number | undefined {
    return this._pageCount;
  }

  /**
   * Indicates the sort order for this result set. PagedResults does not actually sort results;
   * this is a pass-through field to indicate to the source of the data how to sort
   */
  sort(columns: string[], directions: SortDirectionDef[]): void {
    if (columns.length !== directions.length) {
      throw new IllegalArgumentError('Each sort column must have a matching direction');
    }
    this._sortBy = [...columns];
    this._sortDir = [...directions];
  }

  get sortBy(): string[] {
    return [...this._sortBy];
  }

  get sortDir(): SortDirectionDef[] {
    return [...this._sortDir];
  }

  /**
   * Creates a new PagedResults from a serialized PagedResults. This expects the input from
   * {@code toJSON}
   */
  static newInstance<T>(data: any, mapper: ((obj: any) => T)): PagedResults<T> {
    const pr = new PagedResults<T>();
    if (data.pageSize) {
      pr.pageSize = data.pageSize;
    }
    if (data.pageNumber) {
      pr.pageNumber = data.pageNumber;
    }
    if (data.pageToken) {
      pr.pageToken = data.pageToken;
    }
    if (data.paginationMode) {
      pr.paginationMode = data.paginationMode;
    }
    if (data.count && data.count > 0) {
      pr.count = data.count;
    }
    if (data.sortBy && data.sortDir) {
      pr.sort(data.sortBy, data.sortDir);
    }
    pr.items = data.items?.map((item) => mapper(item));
    return pr;
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }

  toDebugString(): string {
    return JSON.stringify(this.toJSON(), null, 2);
  }

  toJSON(): any {
    return {
      count: this.count || -1,
      pageCount: this.pageCount || -1,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      pageToken: this.pageToken,
      paginationMode: this.paginationMode,
      items: this.items,
      columnOptions: this.columnOptions,
      sortBy: this.sortBy,
      sortDir: this.sortDir,
    };
  }

  set pageNumber(pageNumber: number) {
    if (pageNumber < 1) {
      // don't make UI devs do math...
      throw new InvalidInputError('page number', pageNumber);
    }
    this._pageNumber = pageNumber;
  }

  get pageNumber(): number {
    return this._pageNumber;
  }

  get pageSize(): number {
    return this._pageSize;
  }

  set pageSize(pageSize: number) {
    if (pageSize <= 0) {
      throw new InvalidInputError('page size', pageSize);
    }
    this._pageSize = pageSize;
    this.calculatePageCount();
  }

  get items(): Array<T> {
    return this._items;
  }

  set items(items: Array<T>) {
    if (items && items.length > this._pageSize) {
      throw new ResultLimitExceededError(this._pageSize, items.length);
    }
    this._items = items;
  }

  get columnOptions(): Record<string, PagedResultsColumnOptionsDef> {
    return this._columnOptions;
  }

  getColumnOptionsForColumn(columnName: string): PagedResultsColumnOptionsDef {
    return this._columnOptions[columnName];
  }

  setColumnOptions(columnName: string, columnOptions: PagedResultsColumnOptionsDef): void {
    this._columnOptions[columnName] = columnOptions;
  }

  get searchColumnOptions(): Record<string, PagedResultsSearchColumnOptionsDef> {
    return this._searchColumnOptions;
  }

  getSearchColumnOptionsForColumn(columnName: string): PagedResultsSearchColumnOptionsDef {
    return this._searchColumnOptions[columnName];
  }

  setSearchColumnOptions(
    columnName: string,
    columnOptions: PagedResultsSearchColumnOptionsDef
  ): void {
    this._searchColumnOptions[columnName] = columnOptions;
  }

  /**
   * Given the list of column names that are returned by the pagedResults types we will build
   * an initial set of result columns for api use
   */
  buildInitialResultColumns(columns: string[]) {
    const baseColumnDef: PagedResultsColumnOptionsDef = {
      sortable: false,
      searchable: false,
      filterable: false,
      filter: undefined,
    };
    for (const column of columns) { this._columnOptions[column] = baseColumnDef; }
  }

  async getColumnOptions(): Promise<Record<string, PagedResultsColumnOptionsDef>> {
    try {
      this._columnOptions = await this.fetchColumnOptions();
      return this._columnOptions;
    } catch (error: any) {
      console.log(`We failed to get column options: ${JSON.stringify({
        baseUrlOrigin: this.baseUrl?.origin,
        baseUrlPath: this.baseUrl?.path,
        headers: this.headers,
        errorMessage: error.message,
        errorStack: error.stack,
      })}`);
      throw error;
    }
  }

  private async fetchColumnOptions(): Promise<Record<string, PagedResultsColumnOptionsDef>> {
    if (!this.baseUrl) {
      throw new InvalidStateError('Cannot fetch column options without baseUrl set');
    }

    const url = `${this.baseUrl.origin}${this.baseUrl.path}/options`;
    const request: AxiosRequestConfig = {
      method: HttpMethod.Get.toString(),
      headers: this.headers,
      timeout: 60_871,
      url,
      params: JSON.parse(JSON.stringify(this.params)),
    };
    return new Promise((resolve: (value: Record<string, PagedResultsColumnOptionsDef>)
    => void, reject: (reason?: any) => void) => {
      setTimeout(() => this.doFetchColumnOptions(1, request, resolve, reject), 0);
    });
  }

  private async doFetchColumnOptions(
    att: number,
    req: AxiosRequestConfig,
    resolve: (value: Record<string, PagedResultsColumnOptionsDef>) => void,
    reject: (reason?: any) => void
  ): Promise<void> {
    try {
      const resp = await axiosReal.request(req);
      // Check for error status codes since validateStatus: () => true allows all through
      if (resp.status >= 400) {
        const error: any = new Error(`Request failed with status ${resp.status}`);
        error.response = resp;
        throw error;
      }
      resolve(resp.data.options);
    } catch (e: any) {
      if (e.response && (e.response.status < 500 && e.response.status !== 408)) {
        // don't retry for 4xx except for a 408 which is a client timeout
        reject(e);
        return;
      }

      if (att < 3) {
        setTimeout(() => this.doFetchColumnOptions(
          att + 1,
          req,
          resolve,
          reject
        ), att * 2000);
      } else {
        reject(e);
      }
    }
  }

  async getSearchColumnOptions(
    columnName: string,
    search: string
  ): Promise<PagedResultsSearchColumnOptionsDef> {
    try {
      this._searchColumnOptions[columnName] = await this.fetchSearchColumnOptions(
        columnName,
        search
      );
      return this._searchColumnOptions[columnName];
    } catch (error: any) {
      console.log(`We failed to get search column options: ${JSON.stringify({
        baseUrlOrigin: this.baseUrl?.origin,
        baseUrlPath: this.baseUrl?.path,
        columnName,
        search,
        headers: this.headers,
        errorMessage: error.message,
        errorStack: error.stack,
      })}`);
      throw error;
    }
  }

  private async fetchSearchColumnOptions(
    columnName: string,
    search: string
  ): Promise<PagedResultsSearchColumnOptionsDef> {
    if (!this.baseUrl) {
      throw new InvalidStateError('Cannot fetch search column options without baseUrl set');
    }

    const params = JSON.parse(JSON.stringify(this.params));
    params.columnName = columnName;
    params.search = search;
    const url = `${this.baseUrl.origin}${this.baseUrl.path}/searchOptions`;
    const request: AxiosRequestConfig = {
      method: HttpMethod.Get.toString(),
      headers: this.headers,
      timeout: 60_871,
      url,
      params,
    };
    return new Promise((resolve: (value: PagedResultsSearchColumnOptionsDef)
    => void, reject: (reason?: any) => void) => {
      setTimeout(() => this.doFetchSearchColumnOptions(1, request, resolve, reject), 0);
    });
  }

  private async doFetchSearchColumnOptions(
    att: number,
    req: AxiosRequestConfig,
    resolve: (value: PagedResultsSearchColumnOptionsDef) => void,
    reject: (reason?: any) => void
  ): Promise<void> {
    try {
      const resp = await axiosReal.request(req);
      // Check for error status codes since validateStatus: () => true allows all through
      if (resp.status >= 400) {
        const error: any = new Error(`Request failed with status ${resp.status}`);
        error.response = resp;
        throw error;
      }
      resolve(resp.data.searchOptions);
    } catch (e: any) {
      if (e.response && (e.response.status < 500 && e.response.status !== 408)) {
        // don't retry for 4xx except for a 408 which is a client timeout
        reject(e);
        return;
      }

      if (att < 3) {
        setTimeout(() => this.doFetchSearchColumnOptions(
          att + 1,
          req,
          resolve,
          reject
        ), att * 2000);
      } else {
        reject(e);
      }
    }
  }

  /**
   * @returns values for the `Link` header which point to the `first`, `last`, `prev`, and `next`
   * pages, if such pages are present and NOT the page represented by this instance.
   * i.e. - if this is the last page, the `last` link will not be present.
   * Additionally, if a page would be duplicated (i.e. - page 1 is both `first` and `prev`),
   * it will only be included once, preferring the `first` and `last` links.
   */
  getLinks(): string[] {
    const links: string[] = [];
    if (this.pageToken) {
      if (!this.baseUrl) {
        throw new InvalidStateError('Cannot compute links without base URL being set');
      }
      const base = `${this.baseUrl.protocol}://${this.baseUrl.host}${this.baseUrl.path}`;
      const params = this.baseUrl.searchParams;
      params.set('pageToken', this.pageToken);
      links.push(`<${base}?${params.toString()}>; rel="next"`);
    } else if (this.pageCount) {
      if (!this.baseUrl) {
        throw new InvalidStateError('Cannot compute links without base URL being set');
      }
      const base = `${this.baseUrl.protocol}://${this.baseUrl.host}${this.baseUrl.path}`;
      const params = JSON.parse(JSON.stringify(this.baseUrl.searchParams));
      params.pageSize = `${this.pageSize}`;
      if (this.pageNumber !== 1) {
        // not first, so we can include 'first'
        params.pageNumber = '1';
        links.push(`<${base}?${new URLSearchParams(params).toString()}>; rel="first"`);
      }
      if (this.pageNumber > 2) {
        // can do prev
        params.pageNumber = `${this.pageNumber - 1}`;
        links.push(`<${base}?${new URLSearchParams(params).toString()}>; rel="prev"`);
      }
      if (this.pageNumber < this.pageCount) {
        // not last
        params.pageNumber = `${this.pageCount}`;
        links.push(`<${base}?${new URLSearchParams(params).toString()}>; rel="last"`);
      }
      if (this.pageNumber + 1 < this.pageCount) {
        // has next
        params.pageNumber = `${this.pageNumber + 1}`;
        links.push(`<${base}?${new URLSearchParams(params).toString()}>; rel="next"`);
      }
    }
    return links;
  }

  /**
   * Calculates and sets {@link _pageCount | the page count} based on the values of {@link _count} and {@link _pageSize}.
   */
  private calculatePageCount(): void {
    this._pageCount = this._count && this._count > 0 && this._pageSize > 0 ? Math.ceil(this._count / this._pageSize) : undefined;
  }

  /**
   * Determines the effective pagination mode to use for fetching pages.
   * Priority: explicit paginationMode > detected mode > presence of pageToken > default to offset
   */
  private getEffectivePaginationMode(): 'cursor' | 'offset' {
    // If explicitly set (not auto), use that mode
    if (this.paginationMode !== 'auto') {
      return this.paginationMode;
    }
    // If we've detected a mode from API responses, use it
    if (this._detectedMode) {
      return this._detectedMode;
    }
    // If pageToken is set, assume cursor mode
    if (this.pageToken) {
      return 'cursor';
    }
    // Default to offset-based pagination
    return 'offset';
  }

  /**
   * Extracts the page token from an API response.
   * Checks multiple common header variations and response body fields.
   * @param resp The Axios response to extract the token from
   * @returns The page token if found, undefined otherwise
   */
  private extractPageToken(resp: AxiosResponse): string | undefined {
    const headers = resp.headers;

    // Check common header variations (axios normalizes to lowercase)
    const headerToken = headers['pagetoken'] ||
                        headers['page-token'] ||
                        headers['x-next-page-token'] ||
                        headers['next-page-token'] ||
                        headers['x-page-token'];

    if (headerToken) {
      return headerToken;
    }

    // Check response body for token (common in REST APIs)
    if (resp.data && typeof resp.data === 'object' && !Array.isArray(resp.data)) {
      return resp.data.pageToken || resp.data.nextPageToken;
    }

    return undefined;
  }

  /**
   * Extracts the items array from a response body. Supports two shapes:
   *   - Raw array body (typical for GET-paginated endpoints)
   *   - Wrapped object with `items`, `results`, or `data` array
   *     (typical for POST/PUT-paginated endpoints that carry pagination
   *     metadata alongside the items)
   * Throws UnexpectedError if neither shape is present so the caller gets
   * a clear diagnostic instead of `resp.data.map is not a function`.
   */
  private extractItems(data: unknown): unknown[] {
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      if (Array.isArray(obj.items)) return obj.items as unknown[];
      if (Array.isArray(obj.results)) return obj.results as unknown[];
      if (Array.isArray(obj.data)) return obj.data as unknown[];
    }
    const preview = typeof data === 'string'
      ? `string(${(data as string).slice(0, 80)}${(data as string).length > 80 ? '...' : ''})`
      : typeof data;
    throw new UnexpectedError(
      `PagedResults: response body is not paginatable — expected an array or `
      + `an object with items/results/data array, got ${preview}`
    );
  }

  /**
   * Detects pagination mode from API response headers and updates internal state.
   * @param resp The Axios response to analyze
   */
  private detectPaginationMode(resp: AxiosResponse): void {
    const headers = resp.headers;

    // Check for cursor indicators
    const hasPageToken = this.extractPageToken(resp) !== undefined;
    if (hasPageToken) {
      this._detectedMode = 'cursor';
      return;
    }

    // Check for offset indicators (total count headers)
    if (headers['x-total-count'] || headers['count'] || headers['total-count']) {
      this._detectedMode = 'offset';
      return;
    }

    // Check response body for offset indicators
    if (
      resp.data &&
      typeof resp.data === 'object' &&
      !Array.isArray(resp.data) &&
      (resp.data.totalCount !== undefined ||
        resp.data.count !== undefined ||
        resp.data.pageCount !== undefined)
    ) {
      this._detectedMode = 'offset';
    }
  }

  /**
   * Applies pager state to an outgoing vendor request, mutating `options`
   * in place. Modules wire this into their HTTP client's request-prep hook
   * to thread cursor/page state without reinventing per-vendor glue.
   *
   * Behavior by contract:
   * - `link-header-next`: in cursor mode injects `options.after` (or
   *   `before`/`cursor` per `cursorParam`) from `pageToken`; deletes `page`.
   *   In offset mode falls through to numeric `page`.
   * - `body-token`: writes `pageToken` to `options.body[tokenPath]` (dotted)
   *   when set; otherwise leaves body unchanged.
   * - `body-url`: when `pageToken` is a full URL, sets `options.url` to it
   *   so the next request goes there directly (Microsoft Graph nextLink).
   * - `header-token`: sets the configured header from `pageToken`.
   * - `page-number`: sets `options.page` from `pageNumber` (offset only).
   *
   * Page size is written to `options[contract.pageSizeParam ?? 'per_page']`.
   * Set `pageSizeParam: ''` on the contract to omit page-size entirely.
   */
  applyToRequest(options: Record<string, any>, contract: PaginationContract): void {
    const sizeKey = contract.pageSizeParam ?? 'per_page';
    if (sizeKey) {
      options[sizeKey] = this.pageSize;
    }
    switch (contract.kind) {
      case 'link-header-next': {
        if (this.paginationMode === 'cursor') {
          const param = contract.cursorParam ?? 'after';
          delete options.page;
          if (this.pageToken) {
            options[param] = this.pageToken;
          } else {
            delete options[param];
          }
        } else {
          options.page = this.pageNumber;
        }
        return;
      }
      case 'body-token': {
        if (this.pageToken) {
          options.body = options.body ?? {};
          writePath(options.body, contract.tokenPath, this.pageToken);
        }
        return;
      }
      case 'body-url': {
        if (this.pageToken) {
          options.url = this.pageToken;
        }
        return;
      }
      case 'header-token': {
        // axios normalizes outgoing header names; we write at the configured
        // casing on the request side, but consumeResponse checks both
        // configured + lowercased on the response side.
        options.headers = options.headers ?? {};
        if (this.pageToken) {
          options.headers[contract.headerName] = this.pageToken;
        } else {
          delete options.headers[contract.headerName];
        }
        return;
      }
      case 'page-number': {
        options.page = this.pageNumber;
        return;
      }
      default: {
        const _exhaustive: never = contract;
        throw new InvalidStateError(
          `Unhandled PaginationContract kind: ${(contract as { kind: string }).kind}`
        );
      }
    }
  }

  /**
   * Reads a vendor response and updates pager state (pageToken, count) per
   * the contract. Modules wire this into their HTTP client's response hook.
   * Always populates `pageToken` to the next-page cursor when available, and
   * clears it when the response signals no more pages — so the client-side
   * `asyncGenerator` cursor branch terminates correctly.
   */
  consumeResponse(
    response: { headers?: Record<string, any>, data?: any },
    contract: PaginationContract
  ): void {
    const headers = response.headers ?? {};
    const data = response.data;
    switch (contract.kind) {
      case 'link-header-next': {
        // Cursor mode is the common case for this contract; in offset mode
        // we still parse rel="last" to estimate count (legacy behavior).
        if (this.paginationMode === 'cursor') {
          this.pageToken = undefined;
          const linkHeader = headers.link;
          if (linkHeader) {
            const parsed = parseLinkHeader(linkHeader);
            const nextUrl = parsed.next;
            if (nextUrl) {
              const cursor = extractCursorParam(nextUrl, contract.cursorParam);
              if (cursor) this.pageToken = cursor;
            }
          }
        } else {
          const linkHeader = headers.link;
          if (linkHeader) {
            const parsed = parseLinkHeader(linkHeader);
            if (parsed.last) {
              try {
                const u = new globalThis.URL(parsed.last);
                const page = u.searchParams.get('page');
                const pageNum = page ? Number(page) : Number.NaN;
                if (Number.isFinite(pageNum) && pageNum > 0) {
                  this.count = pageNum * this.pageSize;
                }
              } catch {
                // ignore unparseable URL
              }
            }
          }
        }
        return;
      }
      case 'body-token': {
        const token = readPath(data, contract.tokenPath);
        this.pageToken = (typeof token === 'string' && token) ? token : undefined;
        return;
      }
      case 'body-url': {
        const url = readPath(data, contract.urlPath);
        this.pageToken = (typeof url === 'string' && url) ? url : undefined;
        return;
      }
      case 'header-token': {
        const token = headers[contract.headerName] ?? headers[contract.headerName.toLowerCase()];
        this.pageToken = (typeof token === 'string' && token) ? token : undefined;
        return;
      }
      case 'page-number': {
        // Offset only: pageToken stays untouched. Caller uses
        // page.length < pageSize to detect the last page.
        return;
      }
      default: {
        const _exhaustive: never = contract;
        throw new InvalidStateError(
          `Unhandled PaginationContract kind: ${(contract as { kind: string }).kind}`
        );
      }
    }
  }

  /**
   * Ingests the content of the given array into this instance
   * @param arr the array to ingest
   * @param pageNumber the page number to display
   * @param pageSize the size of the page
   */
  ingest(arr: Array<T>, pageNumber = 1, pageSize = 50, pageToken?: string): void {
    if (pageNumber < 1) {
      throw new InvalidInputError('page number', pageNumber);
    }
    const pageCount = arr.length > 0 ? Math.ceil(arr.length / pageSize) : 1;
    if (pageNumber > pageCount) {
      throw new IllegalArgumentError(
        `Requested page ${pageNumber} but only ${pageCount} pages exist`
      );
    }
    const beg = (pageNumber - 1) * pageSize;
    const end = beg + pageSize;
    this.pageSize = pageSize;
    this.pageNumber = pageNumber;
    this.pageToken = pageToken;
    this.count = arr.length;
    this.items = arr.slice(beg, end);
  }

  /**
   * @returns a PagedResults from an array. If `count` is not provided, it is assumed to be
   * the length of the array. If `count` is not known, a negative value should be provided.
   */
  static fromArray<A>(
    arr: Array<A>,
    pageNumber = 1,
    pageSize = 50,
    count?: number,
    pageToken?: string
  ): PagedResults<A> {
    const results = new PagedResults<A>();
    if (pageNumber < 1) {
      throw new InvalidInputError('page number', pageNumber);
    }
    const pageCount = arr.length > 0 ? Math.ceil(arr.length / pageSize) : 1;
    if (pageNumber > pageCount) {
      throw new IllegalArgumentError(
        `Requested page ${pageNumber} but only ${pageCount} pages exist`
      );
    }
    const beg = (pageNumber - 1) * pageSize;
    const end = beg + pageSize;
    results.pageSize = pageSize;
    results.pageNumber = pageNumber;
    results.pageToken = pageToken;
    results.count = count || arr.length;
    results.items = arr.slice(beg, end);
    return results;
  }

  private async doFetch(
    attempt: number,
    req: AxiosRequestConfig,
    resolve: (value: T[]) => void,
    reject: (reason?: any) => void
  ): Promise<void> {
    try {
      const resp = await axiosReal.request(req);
      // Check for error status codes since validateStatus: () => true allows all through
      if (resp.status >= 400) {
        const error: any = new Error(`Request failed with status ${resp.status}`);
        error.response = resp;
        throw error;
      }

      // Detect pagination mode from response (for 'auto' mode)
      if (this.paginationMode === 'auto' && !this._detectedMode) {
        this.detectPaginationMode(resp);
      }

      // Extract page token from response (supports multiple header formats and body)
      // Clear pageToken if not present in response (end of cursor pagination)
      const nextToken = this.extractPageToken(resp);
      this.pageToken = nextToken || undefined;

      const items = this.extractItems(resp.data);
      resolve(items.map((obj: any) => (this.mapper ? this.mapper(obj) : obj)));
    } catch (e: any) {
      if (e.response && (e.response.status < 500 && e.response.status !== 408)) {
        // don't retry for 4xx except for a 408 which is a client timeout
        reject(e);
        return;
      }
      if (attempt < 3) {
        setTimeout(() => this.doFetch(attempt + 1, req, resolve, reject), attempt * 2000);
      } else {
        reject(e);
      }
    }
  }

  private async fetchPage(pageNumber: number): Promise<T[]> {
    if (!this.baseUrl) {
      throw new InvalidStateError('Cannot fetch a page without baseUrl set');
    }

    let url = '';
    const body: Record<string, unknown> = { ...this.body };
    const mode = this.getEffectivePaginationMode();

    if (HttpMethod.Get.eq(this.httpMethod)) {
      // Smart parameter selection - only send pageToken OR pageNumber, not both
      const params: Record<string, string> = {
        pageSize: `${this.pageSize}`,
      };

      if (mode === 'cursor' && this.pageToken) {
        // Cursor-based: use pageToken only
        params.pageToken = this.pageToken;
      } else {
        // Offset-based: use pageNumber only
        params.pageNumber = `${pageNumber}`;
      }

      url = `${this.baseUrl.origin}${this.baseUrl.path}?${new URLSearchParams(params).toString()}`;
    } else if (HttpMethod.Post.eq(this.httpMethod) || HttpMethod.Put.eq(this.httpMethod)) {
      body.pageSize = this.pageSize;

      // Smart parameter selection for request body
      if (mode === 'cursor' && this.pageToken) {
        // Cursor-based: use pageToken only
        body.pageToken = this.pageToken;
      } else {
        // Offset-based: use pageNumber only
        body.pageNumber = pageNumber;
      }

      url = `${this.baseUrl}`;
    } else {
      throw new InvalidStateError(`HTTP method ${this.httpMethod} is unsupported`);
    }

    const request = {
      method: this.httpMethod.toString(),
      data: body,
      headers: this.headers,
      timeout: 60_871,
      url,
    };
    return new Promise((resolve: (value: T[]) => void, reject: (reason?: any) => void) => {
      setTimeout(() => this.doFetch(1, request, resolve, reject), 0);
    });
  }

  async* asyncGenerator() {
    if (this.baseUrl) {
      const mode = this.getEffectivePaginationMode();

      // Yield current page items first
      for (const item of this.items) {
        yield item;
      }

      let pagesFetched = 0;
      // Only compares remote pages against the immediately preceding remote
      // page. The prefilled "current page" is intentionally not seeded here
      // because callers commonly construct a pager from the first response
      // and re-fetch it as page 1 of the loop, which is not a bug.
      let prevFingerprint: string | undefined;
      const overLimit = (): boolean =>
        this.maxPages > 0 && pagesFetched >= this.maxPages;
      const dupCheck = (page: T[]): void => {
        if (!this.detectDuplicatePages || page.length === 0) return;
        const fp = pageFingerprint(page);
        if (fp && prevFingerprint && fp === prevFingerprint) {
          throw new UnexpectedError(
            'PagedResults: duplicate page detected (consecutive pages match) — '
            + 'likely pagination bug in source (cursor not advancing or page param ignored)'
          );
        }
        prevFingerprint = fp;
      };

      if (mode === 'cursor') {
        // Cursor-based pagination: follow pageToken chain
        // pageToken is updated by doFetch() via extractPageToken()
        while (this.pageToken) {
          if (overLimit()) {
            throw new UnexpectedError(
              `PagedResults: maxPages (${this.maxPages}) exceeded in cursor mode — `
              + 'aborting to avoid runaway pagination'
            );
          }
          const page = await this.fetchPage(0); // pageNumber ignored in cursor mode
          pagesFetched += 1;
          if (page.length === 0) {
            break;
          }
          dupCheck(page);
          for (const item of page) {
            yield item;
          }
          // Note: pageToken is updated (or cleared) by doFetch after each request
        }
      } else {
        // Offset-based pagination: increment page numbers
        let pageNum = this.pageNumber + 1;
        let hasMore = this.items.length === this.pageSize;

        while (hasMore) {
          if (overLimit()) {
            throw new UnexpectedError(
              `PagedResults: maxPages (${this.maxPages}) exceeded in offset mode — `
              + 'aborting to avoid runaway pagination'
            );
          }
          const page = await this.fetchPage(pageNum);
          pagesFetched += 1;
          if (page.length === 0) {
            break;
          }
          dupCheck(page);
          for (const item of page) {
            yield item;
          }
          hasMore = page.length === this.pageSize;
          pageNum += 1;
        }
      }
    } else {
      // Local iteration - no remote fetching, just iterate what we have
      for (const item of this.items) {
        yield item;
      }
    }
  }

  [Symbol.asyncIterator] = this.asyncGenerator;

  async forEach(func: (obj: T) => Promise<void>, executors = 10, limit?: number): Promise<void> {
    if (limit !== undefined && limit < 1) {
      throw new InvalidInputError('limit', limit);
    }

    const limiter = pLimit(executors);
    const inflight = new Set<Promise<void>>();
    let count = 0;
    let firstError: unknown;

    for await (const item of this) {
      if (firstError) break;
      if (limit && count >= limit) break;
      count += 1;

      // Per-task .then/.catch swallows the rejection so inflight promises
      // never reject — this avoids unhandled-rejection warnings in the
      // window between failure and the next await point.
      const task: Promise<void> = limiter(() => func(item)).then(
        () => { inflight.delete(task); },
        (err: unknown) => {
          inflight.delete(task);
          if (!firstError) firstError = err;
        }
      );
      inflight.add(task);

      // Backpressure: when the limiter's queue is saturated, pause pulling
      // from the iterator until a slot frees up. This caps the limiter
      // queue at ~executors items instead of letting the entire current
      // page (and the next, and the next) pile up ahead of the workers.
      if (limiter.pendingCount >= executors) {
        await Promise.race(inflight);
      }
    }

    await Promise.all(inflight);
    if (firstError) throw firstError;
  }
}
