import * as qs from 'query-string';
import { PromisePool } from '@supercharge/promise-pool';
import axios, { AxiosRequestConfig } from 'axios';
import {
  IllegalArgumentError,
  InvalidInputError,
  InvalidStateError,
  ResultLimitExceededError
} from './errors/index.js';
import { URL } from './types/URL.js';
import { HttpMethod, Nmtoken, UUID } from '.';
import { SortDirectionDef } from '../generated/model.js';

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
    if (data.count && data.count > 0) {
      pr.count = data.count;
    }
    if (data.sortBy && data.sortDir) {
      pr.sort(data.sortBy, data.sortDir);
    }
    pr.items = data.items?.map(mapper);
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
    columns.forEach((column) => { this._columnOptions[column] = baseColumnDef; });
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
      timeout: 60871,
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
      resolve(await axiosReal.request(req).then((resp) => resp.data.options));
    } catch (e: any) {
      if (e.response && (e.response.status < 500 && e.response.status !== 408)) {
        // don't retry for 4xx except for a 408 which is a client timeout
        reject(e);
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
      timeout: 60871,
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
      resolve(await axiosReal.request(req).then((resp) => resp.data.searchOptions));
    } catch (e: any) {
      if (e.response && (e.response.status < 500 && e.response.status !== 408)) {
        // don't retry for 4xx except for a 408 which is a client timeout
        reject(e);
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
   * @returns values for the `Link` header which point to the `first`, `last`, `prev`, and `next` pages, if such pages are present and NOT the page represented by this instance. i.e. - if this is the last page, the `last` link will not be present. Additionally, if a page would be duplicated (i.e. - page 1 is both `first` and `prev`), it will only be included once, preferring the `first` and `last` links.
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
        links.push(`<${base}?${qs.stringify(params)}>; rel="first"`);
      }
      if (this.pageNumber > 2) {
        // can do prev
        params.pageNumber = `${this.pageNumber - 1}`;
        links.push(`<${base}?${qs.stringify(params)}>; rel="prev"`);
      }
      if (this.pageNumber < this.pageCount) {
        // not last
        params.pageNumber = `${this.pageCount}`;
        links.push(`<${base}?${qs.stringify(params)}>; rel="last"`);
      }
      if (this.pageNumber + 1 < this.pageCount) {
        // has next
        params.pageNumber = `${this.pageNumber + 1}`;
        links.push(`<${base}?${qs.stringify(params)}>; rel="next"`);
      }
    }
    return links;
  }

  /**
   * Calculates and sets {@link _pageCount | the page count} based on the values of {@link _count} and {@link _pageSize}.
   */
  private calculatePageCount(): void {
    if (this._count && this._count > 0 && this._pageSize > 0) {
      this._pageCount = Math.ceil(this._count / this._pageSize);
    } else {
      this._pageCount = undefined;
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
    const pageCount = arr.length ? Math.ceil(arr.length / pageSize) : 1;
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
    const pageCount = arr.length ? Math.ceil(arr.length / pageSize) : 1;
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
      resolve(await axiosReal
        .request(req)
        .then((resp) => {
          if (resp.headers.pagetoken) {
            this.pageToken = resp.headers.pagetoken;
          }
          return resp.data.map((obj: any) => (this.mapper ? this.mapper(obj) : obj));
        }));
    } catch (e: any) {
      if (e.response && (e.response.status < 500 && e.response.status !== 408)) {
        // don't retry for 4xx except for a 408 which is a client timeout
        reject(e);
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
    if (HttpMethod.Get.eq(this.httpMethod)) {
      const params = {
        pageSize: `${this.pageSize}`,
        pageNumber: `${pageNumber}`,
        pageToken: `${this.pageToken}`,
      };
      url = `${this.baseUrl.origin}${this.baseUrl.path}?${qs.stringify(params)}`;
    } else if (HttpMethod.Post.eq(this.httpMethod) || HttpMethod.Put.eq(this.httpMethod)) {
      body.pageSize = this.pageSize;
      body.pageNumber = pageNumber;
      body.pageToken = this.pageToken;
      url = `${this.baseUrl}`;
    } else {
      throw new InvalidStateError(`HTTP method ${this.httpMethod} is unsupported`);
    }

    const request = {
      method: this.httpMethod.toString(),
      data: body,
      headers: this.headers,
      timeout: 60871,
      url,
    };
    return new Promise((resolve: (value: T[]) => void, reject: (reason?: any) => void) => {
      setTimeout(() => this.doFetch(1, request, resolve, reject), 0);
    });
  }

  async* asyncGenerator() {
    if (this.baseUrl) {
      // TODO: don't prefetch them all, JIT them
      let done = false;
      let pageNum = 1;
      while (!done) {
        let page: T[] = [];
        if (pageNum === this.pageNumber) {
          page = this.items;
        } else {
          // eslint-disable-next-line no-await-in-loop
          page = await this.fetchPage(pageNum);
        }
        if (page.length < this.pageSize) {
          done = true;
        }
        pageNum += 1;
        let i = -1;
        // eslint-disable-next-line no-plusplus
        while (++i < page.length) {
          yield page[i];
        }
      }
    } else {
      // just iterate through what we have
      let i = -1;
      // eslint-disable-next-line no-plusplus
      while (++i < this.items.length) {
        yield this.items[i];
      }
    }
  }

  [Symbol.asyncIterator] = this.asyncGenerator;

  async forEach(func: (obj: T) => Promise<void>, executors = 10, limit?: number): Promise<void> {
    if (limit !== undefined && limit < 1) {
      throw new InvalidInputError('limit', limit);
    }
    const allItems: T[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for await (const item of this) {
      allItems.push(item);
      if (limit && allItems.length >= limit) {
        break;
      }
    }
    return PromisePool
      .withConcurrency(executors)
      .for(allItems)
      .handleError(async (err, data) => { throw err; })
      .process(async (data, index) => {
        await func(allItems[index]);
      })
      .then(() => Promise.resolve());
  }
}
