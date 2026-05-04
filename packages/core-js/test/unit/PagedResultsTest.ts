/* eslint-disable */
import { expect } from 'chai';
import {
  URL,
  PagedResults,
  PagedResultsColumnOptionsFilterType,
  PaginationContract,
  IllegalArgumentError,
  InvalidInputError,
  UnexpectedError,
  UUID,
  extractCursorParam,
  pageFingerprint,
  parseLinkHeader,
  readPath,
  writePath
} from '../../src/index.js';
import json from './got.json' with { type: 'json' };

const CHARACTERS = json.characters;
console.info('Testing with %s Game of Thrones characters', CHARACTERS.length);

interface TestType {
  id: string,
  name: string,
  description: string,
  test: string,
  testResource: string,
}

describe('PagedResults', () => {
  it('should handle an array', async () => {
    const pr = PagedResults.fromArray(CHARACTERS);
    expect(pr).to.be.ok;
    expect(pr.pageSize).to.be.eql(50);
    expect(pr.pageNumber).to.be.eql(1);
    expect(pr.count).to.be.eql(CHARACTERS.length);
    expect(pr.items.length).to.be.eql(50);
    expect(pr.pageCount).to.be.eql(Math.ceil(CHARACTERS.length / 50));
    expect(pr.items).to.deep.eq(CHARACTERS.slice(0, 50));
  });

  it('should handle an array with specified page size', async () => {
    const pr = PagedResults.fromArray(CHARACTERS, 1, 20);
    expect(pr).to.be.ok;
    expect(pr.pageSize).to.be.eql(20);
    expect(pr.pageNumber).to.be.eql(1);
    expect(pr.count).to.be.eql(CHARACTERS.length);
    expect(pr.items.length).to.be.eq(20);
    expect(pr.pageCount).to.be.eql(Math.ceil(CHARACTERS.length / 20));
    expect(pr.items).to.deep.eq(CHARACTERS.slice(0, 20));
  });

  it('should handle an array with specified page number', async () => {
    const pr = PagedResults.fromArray(CHARACTERS, 2);
    expect(pr).to.be.ok;
    expect(pr.pageSize).to.be.eql(50);
    expect(pr.pageNumber).to.be.eql(2);
    expect(pr.count).to.be.eql(CHARACTERS.length);
    expect(pr.items.length).to.be.eq(50);
    expect(pr.pageCount).to.be.eql(Math.ceil(CHARACTERS.length / 50));
    expect(pr.items).to.deep.eq(CHARACTERS.slice(50, 100));
  });

  it('should handle a page with no count or pageCount', async () => {
    const pr = new PagedResults();
    pr.pageNumber = 2;
    pr.pageSize = 10;
    pr.items = CHARACTERS.slice(10, 20);

    expect(pr).to.be.ok;
    expect(pr.pageSize).to.be.eql(10);
    expect(pr.pageNumber).to.be.eql(2);
    expect(pr.items.length).to.be.eq(10);
    expect(pr.count).to.be.undefined;
    expect(pr.pageCount).to.be.undefined;
    expect(pr.items).to.deep.eq(CHARACTERS.slice(10, 20));
  });

  it('should barf with page number greater than number of pages', async () => {
    let err;
    const pn = Math.ceil(CHARACTERS.length / 50) + 1;
    try {
      PagedResults.fromArray(CHARACTERS, pn);
    } catch (e) {
      err = e;
    }
    expect(err).not.to.be.undefined;
    expect(err instanceof IllegalArgumentError).to.be.ok;
  });

  it('should return an empty page for the first page with no data', async () => {
    const pr = PagedResults.fromArray([], 1, 1);
    expect(pr).to.be.ok;
    expect(pr.count).to.be.eql(0);
    expect(pr.items.length).to.be.equals(0);
    expect(pr.pageNumber).to.be.eql(1);
    expect(pr.pageSize).to.be.eql(1);
  });

  it('should barf with an empty page for a page that does not exist', async () => {
    let err;
    try {
      PagedResults.fromArray([], 2);
    } catch (e) {
      err = e;
    }
    expect(err).not.to.be.undefined;
    expect(err instanceof IllegalArgumentError).to.be.ok;
  });

  it('should barf with page number less than 1', async () => {
    let err;
    try {
      PagedResults.fromArray(CHARACTERS, 0);
    } catch (e) {
      err = e;
    }
    expect(err).not.to.be.undefined;
    expect(err instanceof InvalidInputError).to.be.ok;
  });

  it('should generate links from page 1', async () => {
    const pr = PagedResults.fromArray(CHARACTERS, 1);
    expect(pr).to.be.ok;

    pr.baseUrl = new URL('http://localhost/prtest');
    const links = pr.getLinks();
    expect(links).to.be.ok;
    expect(links.length).to.be.eq(2);

    let next = false;
    let last = false;

    for (let i = 0, len = links.length; i < len; i++) {
      const l = links[i];
      next = next || (l.includes('rel="next"') && l.includes('pageNumber=2'));
      last = last || (l.includes('rel="last"') && l.includes(`pageNumber=${pr.pageCount}`));
    }

    expect(next).to.be.ok;
    expect(last).to.be.ok;
  });

  it('should generate links from the last page', async () => {
    const pr = PagedResults.fromArray(CHARACTERS, 8);
    expect(pr).to.be.ok;

    pr.baseUrl = new URL('http://localhost/prtest');
    const links = pr.getLinks();
    expect(links).to.be.ok;
    expect(links.length).to.be.eq(2);

    let first = false;
    let prev = false;

    for (let i = 0, len = links.length; i < len; i++) {
      const l = links[i];
      first = first || (l.includes('rel="first"') && l.includes('pageNumber=1'));
      prev = prev || (l.includes('rel="prev"') && l.includes('pageNumber=7'));
    }

    expect(first).to.be.ok;
    expect(prev).to.be.ok;
  });

  it('should generate links from a middle page', async () => {
    const pr = PagedResults.fromArray(CHARACTERS, 3);
    expect(pr).to.be.ok;

    pr.baseUrl = new URL('http://localhost/prtest');
    const links = pr.getLinks();
    expect(links).to.be.ok;
    expect(links.length).to.be.eq(4);

    let first = false;
    let prev = false;
    let next = false;
    let last = false;

    for (let i = 0, len = links.length; i < len; i++) {
      const l = links[i];
      first = first || (l.includes('rel="first"') && l.includes('pageNumber=1'));
      prev = prev || (l.includes('rel="prev"') && l.includes('pageNumber=2'));
      next = next || (l.includes('rel="next"') && l.includes('pageNumber=4'));
      last = last || (l.includes('rel="last"') && l.includes(`pageNumber=${pr.pageCount}`));
    }

    expect(first).to.be.ok;
    expect(prev).to.be.ok;
    expect(next).to.be.ok;
    expect(last).to.be.ok;
  });

  it('should generate no links from a single page response', async () => {
    const pr = PagedResults.fromArray(CHARACTERS);
    pr.pageSize = CHARACTERS.length;
    expect(pr).to.be.ok;
    pr.baseUrl = new URL('http://localhost/prtest');
    const links = pr.getLinks();
    expect(links).to.be.ok;
    expect(links.length).to.be.eq(0);
  });

  it('should not generate duplicate links', async () => {
    const pr = PagedResults.fromArray(CHARACTERS, 2);
    expect(pr).to.be.ok;
    pr.pageSize = Math.ceil(CHARACTERS.length / 3);

    pr.baseUrl = new URL('http://localhost/prtest');
    const links = pr.getLinks();
    expect(links).to.be.ok;
    expect(links.length).to.be.eq(2);

    let first = false;
    let last = false;

    for (let i = 0, len = links.length; i < len; i++) {
      const l = links[i];
      first = first || (l.includes('rel="first"') && l.includes('pageNumber=1'));
      last = last || (l.includes('rel="last"') && l.includes(`pageNumber=${pr.pageCount}`));
    }

    expect(first).to.be.ok;
    expect(last).to.be.ok;
  });

  it('should ingest an array with specified page size', async () => {
    const pr = new PagedResults();
    pr.ingest(CHARACTERS, 1, 20);
    expect(pr).to.be.ok;
    expect(pr.pageSize).to.be.eql(20);
    expect(pr.pageNumber).to.be.eql(1);
    expect(pr.count).to.be.eql(CHARACTERS.length);
    expect(pr.items.length).to.be.eq(20);
    expect(pr.pageCount).to.be.eql(Math.ceil(CHARACTERS.length / 20));
    expect(pr.items).to.deep.eq(CHARACTERS.slice(0, 20));
  });

  it('should serialize to JSON', async () => {
    const pr = new PagedResults();
    pr.ingest(CHARACTERS, 1, 20);
    const json = pr.toJSON();
    expect(json).to.be.ok;
    expect(json.pageSize).to.be.eql(20);
    expect(json.pageNumber).to.be.eql(1);
    expect(json.count).to.be.eql(CHARACTERS.length);
    expect(json.items.length).to.be.eq(20);
    expect(json.pageCount).to.be.eql(Math.ceil(CHARACTERS.length / 20));
    expect(json.items).to.deep.eq(CHARACTERS.slice(0, 20));
  });

  it('should deserialize from JSON', async () => {
    const orig = new PagedResults();
    orig.ingest(CHARACTERS, 1, 20);
    const json = orig.toJSON();
    const pr = PagedResults.newInstance(json, (obj: any) => obj);
    expect(pr).to.be.ok;
    expect(pr.pageSize).to.be.eql(20);
    expect(pr.pageNumber).to.be.eql(1);
    expect(pr.count).to.be.eql(CHARACTERS.length);
    expect(pr.items.length).to.be.eq(20);
    expect(pr.pageCount).to.be.eql(Math.ceil(CHARACTERS.length / 20));
    expect(pr.items).to.deep.eq(CHARACTERS.slice(0, 20));
  });

  it('should iterate over an array', async () => {
    const orig = new PagedResults();
    orig.ingest(CHARACTERS, 1, 20);
    let count = 0;
    for await (const char of orig) {
      expect(char).to.be.deep.eq(CHARACTERS[count++]);
    }
    expect(count).to.be.eq(20);
  });

  it('should throw error on paged results forEach', async () => {
    const pr = PagedResults.fromArray([1], 1, 1);
    try {
      await pr.forEach(async (item) => {
        throw new Error(`${item}`);
      });
    } catch (e: any) {
      expect(e.message).to.be.eq('1');
      return;
    }
    expect.fail('expected to throw error');
  });

  it('should process every item in forEach', async () => {
    const pr = PagedResults.fromArray(CHARACTERS, 1, CHARACTERS.length);
    const seen: any[] = [];
    await pr.forEach(async (item) => {
      seen.push(item);
    });
    expect(seen.length).to.be.eq(CHARACTERS.length);
    expect(seen).to.have.deep.members(CHARACTERS);
  });

  it('should respect the limit arg in forEach', async () => {
    const pr = PagedResults.fromArray(CHARACTERS, 1, CHARACTERS.length);
    let processed = 0;
    await pr.forEach(async () => { processed += 1; }, 5, 7);
    expect(processed).to.be.eq(7);
  });

  it('should reject limit < 1 in forEach', async () => {
    const pr = PagedResults.fromArray([1, 2, 3], 1, 3);
    try {
      await pr.forEach(async () => { /* noop */ }, 2, 0);
    } catch (e) {
      expect(e).to.be.instanceOf(InvalidInputError);
      return;
    }
    expect.fail('expected to throw');
  });

  it('should cap concurrency at executors in forEach', async () => {
    const pr = PagedResults.fromArray(CHARACTERS, 1, CHARACTERS.length);
    const EXECUTORS = 4;
    let inflight = 0;
    let peak = 0;
    await pr.forEach(async () => {
      inflight += 1;
      peak = Math.max(peak, inflight);
      await new Promise((r) => setTimeout(r, 5));
      inflight -= 1;
    }, EXECUTORS);
    expect(peak).to.be.lte(EXECUTORS);
    expect(peak).to.be.gte(1);
  });

  it('should stop pulling items after first error in forEach', async () => {
    const pr = PagedResults.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1, 10);
    let started = 0;
    try {
      await pr.forEach(async (item) => {
        started += 1;
        if (item === 2) throw new Error('boom');
        await new Promise((r) => setTimeout(r, 20));
      }, 2);
    } catch (e: any) {
      expect(e.message).to.be.eq('boom');
      // With executors=2 and a fail-fast loop, we should not have started
      // every item — the iterator stops pulling once the error is seen.
      expect(started).to.be.lt(10);
      return;
    }
    expect.fail('expected to throw');
  });

  it('should stream pages in forEach instead of pre-fetching all of them', async () => {
    // Multi-page remote PagedResults: initial page is local, the rest are
    // fetched lazily by asyncGenerator -> fetchPage. Stub fetchPage to avoid
    // axios and to record exactly when each fetch happens relative to how
    // many items the worker has finished.
    const PAGE_SIZE = 5;
    const REMOTE_PAGES = 6; // pages 2..7 carry data; page 8 is the empty terminator
    const TOTAL_ITEMS = PAGE_SIZE * (1 + REMOTE_PAGES); // 35

    const pr = new PagedResults<number>();
    pr.baseUrl = new URL('http://localhost/streamtest');
    pr.pageNumber = 1;
    pr.pageSize = PAGE_SIZE;
    pr.items = Array.from({ length: PAGE_SIZE }, (_, i) => i);

    let processed = 0;
    const fetchLog: { page: number; processedAt: number }[] = [];

    (pr as any).fetchPage = async (pageNum: number): Promise<number[]> => {
      fetchLog.push({ page: pageNum, processedAt: processed });
      // Simulate I/O so the iterator yields the event loop, letting workers
      // make progress between fetches.
      await new Promise((r) => setTimeout(r, 1));
      if (pageNum > 1 + REMOTE_PAGES) return [];
      const start = (pageNum - 1) * PAGE_SIZE;
      return Array.from({ length: PAGE_SIZE }, (_, i) => start + i);
    };

    await pr.forEach(async () => {
      await new Promise((r) => setTimeout(r, 5));
      processed += 1;
    }, 2);

    expect(processed).to.be.eq(TOTAL_ITEMS);
    // Pages 2..7 carry data, plus one trailing empty fetch that signals end.
    expect(fetchLog.length).to.be.eq(REMOTE_PAGES + 1);
    expect(fetchLog[0].page).to.be.eq(2);

    // Under the old buffer-then-process implementation the iterator was
    // fully drained before any worker ran, so every fetchLog entry would
    // have processedAt === 0. The streaming + backpressure fix means the
    // last fetch only happens after workers have already drained most of
    // the prior pages.
    const lastFetch = fetchLog[fetchLog.length - 1];
    expect(lastFetch.processedAt).to.be.greaterThan(0);

    // Tighter bound: with executors=2 the iterator runs at most a small
    // buffer ahead of the workers, so by the time the trailing empty fetch
    // happens we should have processed nearly everything (allow ~1 page of
    // slack for in-flight + queued items).
    expect(lastFetch.processedAt).to.be.greaterThan(TOTAL_ITEMS - PAGE_SIZE * 2);

    // No fetch should happen with the iterator more than ~1 page ahead of
    // the worker. Each fetch for page N should occur after at least
    // (N - 2) * PAGE_SIZE items have been processed, minus a buffer slack.
    for (const entry of fetchLog) {
      const expectedFloor = Math.max(0, (entry.page - 2) * PAGE_SIZE - PAGE_SIZE);
      expect(entry.processedAt).to.be.gte(expectedFloor);
    }
  });

  it('should build initial paged results result columns and get', async () => {
    const pr = new PagedResults<TestType>();
    pr.buildInitialResultColumns(['id', 'name', 'description', 'test', 'testResource']);
    expect(pr).to.be.ok;
    expect(pr.columnOptions).to.be.not.undefined;
    expect(Object.keys(pr.columnOptions).length).to.be.eq(5);
    expect(pr.columnOptions['fake']).to.be.undefined;
    expect(pr.columnOptions['id']).to.be.not.undefined;
    expect(pr.columnOptions['id'].sortable).to.be.false;
    expect(pr.columnOptions['name']).to.be.not.undefined;
    expect(pr.columnOptions['name'].sortable).to.be.false;
    expect(pr.columnOptions['description']).to.be.not.undefined;
    expect(pr.columnOptions['description'].sortable).to.be.false;
    expect(pr.columnOptions['test']).to.be.not.undefined;
    expect(pr.columnOptions['test'].sortable).to.be.false;
    expect(pr.columnOptions['testResource']).to.be.not.undefined;
    expect(pr.columnOptions['testResource'].sortable).to.be.false;

    const nameResultColumn = pr.getColumnOptionsForColumn('name');
    expect(nameResultColumn).to.be.not.undefined;
    expect(nameResultColumn.sortable).to.be.false;
    expect(nameResultColumn.searchable).to.be.false;
    expect(nameResultColumn.filterable).to.be.false;
    expect(nameResultColumn.filter).to.be.undefined;
  });

  it('should set paged results result columns', async () => {
    const pr = new PagedResults<TestType>();
    pr.setColumnOptions('name', {
      sortable: true,
      searchable: true,
      filterable: false,
    });
    pr.setColumnOptions('test', {
      sortable: false,
      searchable: true,
      filterable: true,
      filter: {
        multi: true,
        type: PagedResultsColumnOptionsFilterType.String,
        options: [
          'test1',
          'test2',
        ],
      }
    });
    pr.setColumnOptions('testResource', {
      sortable: true,
      searchable: false,
      filterable: true,
      filter: {
        multi: false,
        type: PagedResultsColumnOptionsFilterType.Resource,
        options: [
          {
            id: UUID.generateV4(),
            name: 'test1',
          },
          {
            id: UUID.generateV4(),
            name: 'test2',
          }
        ],
      }
    });
    expect(pr).to.be.ok;
    expect(pr.columnOptions).to.be.not.undefined;
    expect(Object.keys(pr.columnOptions).length).to.be.eq(3);
    expect(pr.columnOptions['fake']).to.be.undefined;
    expect(pr.columnOptions['name']).to.be.not.undefined;
    expect(pr.columnOptions['test']).to.be.not.undefined;
    expect(pr.columnOptions['testResource']).to.be.not.undefined;
    expect(pr.columnOptions['name'].sortable).to.be.true;
    expect(pr.columnOptions['name'].searchable).to.be.true;
    expect(pr.columnOptions['name'].filterable).to.be.false;
    expect(pr.columnOptions['test'].sortable).to.be.false;
    expect(pr.columnOptions['test'].searchable).to.be.true;
    expect(pr.columnOptions['test'].filterable).to.be.true;
    expect(pr.columnOptions['test'].filter).to.be.not.undefined;
    expect(pr.columnOptions['test'].filter?.multi).to.be.true;
    expect(pr.columnOptions['test'].filter?.type).to.be.eq(PagedResultsColumnOptionsFilterType.String);
    expect(pr.columnOptions['test'].filter?.options.length).to.be.eq(2);
    expect(pr.columnOptions['test'].filter?.options[0]).to.be.eq('test1');
    expect(pr.columnOptions['testResource'].sortable).to.be.true;
    expect(pr.columnOptions['testResource'].searchable).to.be.false;
    expect(pr.columnOptions['testResource'].filterable).to.be.true;
    expect(pr.columnOptions['testResource'].filter).to.be.not.undefined;
    expect(pr.columnOptions['testResource'].filter?.multi).to.be.false;
    expect(pr.columnOptions['testResource'].filter?.type).to.be.eq(PagedResultsColumnOptionsFilterType.Resource);
    expect(pr.columnOptions['testResource'].filter?.options.length).to.be.eq(2);
    expect(pr.columnOptions['testResource'].filter?.options[0]['name']).to.be.eq('test1');
  });
});

describe('parseLinkHeader', () => {
  it('parses single-rel header', () => {
    const h = '<https://api.github.com/x?after=ABC&per_page=100>; rel="next"';
    expect(parseLinkHeader(h)).to.deep.equal({
      next: 'https://api.github.com/x?after=ABC&per_page=100',
    });
  });

  it('parses multi-rel headers in any order', () => {
    const h = [
      '<https://api.github.com/x?page=2>; rel="prev"',
      '<https://api.github.com/x?page=4>; rel="next"',
      '<https://api.github.com/x?page=10>; rel="last"',
      '<https://api.github.com/x?page=1>; rel="first"',
    ].join(', ');
    const parsed = parseLinkHeader(h);
    expect(parsed.next).to.equal('https://api.github.com/x?page=4');
    expect(parsed.last).to.equal('https://api.github.com/x?page=10');
    expect(parsed.prev).to.equal('https://api.github.com/x?page=2');
    expect(parsed.first).to.equal('https://api.github.com/x?page=1');
  });

  it('tolerates unquoted rel values', () => {
    const h = '<https://api.github.com/x?after=ABC>; rel=next';
    expect(parseLinkHeader(h).next).to.equal('https://api.github.com/x?after=ABC');
  });

  it('returns empty for empty/falsy input', () => {
    expect(parseLinkHeader('')).to.deep.equal({});
  });

  it('skips malformed segments without throwing', () => {
    const h = 'garbage, <https://api.github.com/x?after=Z>; rel="next", also bad';
    expect(parseLinkHeader(h).next).to.equal('https://api.github.com/x?after=Z');
  });
});

describe('extractCursorParam', () => {
  it('extracts after cursor', () => {
    expect(extractCursorParam('https://api.github.com/x?after=ABC123&per_page=100'))
      .to.equal('ABC123');
  });

  it('falls back to before cursor', () => {
    expect(extractCursorParam('https://api.github.com/x?before=XYZ')).to.equal('XYZ');
  });

  it('falls back to generic cursor param', () => {
    expect(extractCursorParam('https://example.com/x?cursor=PQR')).to.equal('PQR');
  });

  it('prefers after over before over cursor', () => {
    expect(extractCursorParam('https://x.test/?after=A&before=B&cursor=C')).to.equal('A');
  });

  it('returns undefined when no cursor params present', () => {
    expect(extractCursorParam('https://api.github.com/x?per_page=100')).to.be.undefined;
  });

  it('returns undefined for unparseable URL', () => {
    expect(extractCursorParam('not a url')).to.be.undefined;
  });

  it('honors preferred param when present', () => {
    // Vendor sends both `cursor` and `after`; contract prefers `cursor`.
    expect(extractCursorParam('https://x.test/?after=A&cursor=C', 'cursor')).to.equal('C');
  });

  it('falls back to default order when preferred param absent', () => {
    expect(extractCursorParam('https://x.test/?after=A', 'cursor')).to.equal('A');
  });
});

describe('parseLinkHeader — comma in URL', () => {
  it('does not split inside <> when URL contains a comma', () => {
    // Some vendors include comma in query values; the URL between <> can
    // legitimately contain commas. Naive split-by-comma would mis-parse.
    const h = '<https://api.example.com/x?ids=1,2,3&page=2>; rel="next", '
      + '<https://api.example.com/x?ids=1,2,3&page=10>; rel="last"';
    const parsed = parseLinkHeader(h);
    expect(parsed.next).to.equal('https://api.example.com/x?ids=1,2,3&page=2');
    expect(parsed.last).to.equal('https://api.example.com/x?ids=1,2,3&page=10');
  });
});

describe('readPath / writePath', () => {
  it('reads a top-level field', () => {
    expect(readPath({ NextToken: 'abc' }, 'NextToken')).to.equal('abc');
  });

  it('reads nested fields by dotted path', () => {
    expect(readPath({ paging: { next: { after: 'C2' } } }, 'paging.next.after')).to.equal('C2');
  });

  it('returns undefined for missing path segments', () => {
    expect(readPath({ a: 1 }, 'a.b.c')).to.be.undefined;
    expect(readPath({}, 'x.y')).to.be.undefined;
    expect(readPath(null as any, 'x')).to.be.undefined;
  });

  it('writes a top-level field', () => {
    const o: Record<string, any> = {};
    writePath(o, 'NextToken', 'X');
    expect(o.NextToken).to.equal('X');
  });

  it('writes nested fields creating intermediate objects', () => {
    const o: Record<string, any> = {};
    writePath(o, 'paging.next.after', 'C1');
    expect(o.paging.next.after).to.equal('C1');
  });

  it('throws on non-object intermediate instead of silently overwriting', () => {
    const o: Record<string, any> = { paging: 'string' };
    let err: any;
    try {
      writePath(o, 'paging.next', 'X');
    } catch (e) {
      err = e;
    }
    expect(err).to.be.ok;
    expect(err.message).to.match(/cannot traverse/i);
    // Original primitive must be preserved.
    expect(o.paging).to.equal('string');
  });

  it('does not throw when no path provided', () => {
    const o: Record<string, any> = { a: 1 };
    writePath(o, '', 'X');
    expect(o).to.deep.equal({ a: 1 });
  });
});

describe('pageFingerprint', () => {
  it('returns undefined for empty page', () => {
    expect(pageFingerprint([])).to.be.undefined;
  });

  it('uses id keys when present', () => {
    const a = pageFingerprint([{ id: 'A' }, { id: 'B' }]);
    const b = pageFingerprint([{ id: 'A' }, { id: 'B' }]);
    expect(a).to.equal(b);
  });

  it('produces different fingerprints for different ids', () => {
    expect(pageFingerprint([{ id: 'A' }])).to.not.equal(pageFingerprint([{ id: 'B' }]));
  });

  it('handles GitHub-style number id', () => {
    expect(pageFingerprint([{ number: 1 }])).to.equal(pageFingerprint([{ number: 1 }]));
    expect(pageFingerprint([{ number: 1 }])).to.not.equal(pageFingerprint([{ number: 2 }]));
  });

  it('returns undefined for opaque object items (fail-safe, no JSON fallback)', () => {
    // Items without any of id/number/uuid/_id/name produce undefined so that
    // duplicate detection skips silently rather than risk a false positive
    // on JSON-truncation collisions.
    expect(pageFingerprint([{ misc: 'a' }])).to.be.undefined;
    expect(pageFingerprint([{ id: 'A' }, { misc: 'b' }])).to.be.undefined;
  });

  it('fingerprints primitive items directly', () => {
    expect(pageFingerprint([1, 2, 3])).to.equal(pageFingerprint([1, 2, 3]));
    expect(pageFingerprint([1, 2, 3])).to.not.equal(pageFingerprint([1, 2, 4]));
  });

  it('handles null items in head', () => {
    expect(pageFingerprint([null, null])).to.equal(pageFingerprint([null, null]));
  });

  it('matches AWS-style PascalCase id keys (Name / Id / Arn)', () => {
    // AWS API responses use PascalCase. Without case-insensitive lookup,
    // duplicate detection silently skips for the largest body-token target.
    expect(pageFingerprint([{ Name: 'bucket-1' }])).to.equal(
      pageFingerprint([{ Name: 'bucket-1' }])
    );
    expect(pageFingerprint([{ Name: 'bucket-1' }])).to.not.equal(
      pageFingerprint([{ Name: 'bucket-2' }])
    );
    expect(pageFingerprint([{ Id: 'i-aaa' }])).to.equal(
      pageFingerprint([{ Id: 'i-aaa' }])
    );
    expect(pageFingerprint([{ Arn: 'arn:aws:iam::1:role/x' }])).to.equal(
      pageFingerprint([{ Arn: 'arn:aws:iam::1:role/x' }])
    );
  });
});

describe('PagedResults.applyToRequest / consumeResponse — link-header-next', () => {
  const contract: PaginationContract = { kind: 'link-header-next', cursorParam: 'after' };

  it('cursor mode without pageToken: omits page and after, sets per_page', () => {
    const pr = new PagedResults<any>();
    pr.paginationMode = 'cursor';
    pr.pageSize = 100;
    const opts: Record<string, any> = { page: 5, after: 'STALE' };
    pr.applyToRequest(opts, contract);
    expect(opts.per_page).to.equal(100);
    expect(opts).to.not.have.property('page');
    expect(opts).to.not.have.property('after');
  });

  it('cursor mode with pageToken: injects after, omits page', () => {
    const pr = new PagedResults<any>();
    pr.paginationMode = 'cursor';
    pr.pageSize = 100;
    pr.pageToken = 'C2';
    const opts: Record<string, any> = { page: 5 };
    pr.applyToRequest(opts, contract);
    expect(opts.after).to.equal('C2');
    expect(opts).to.not.have.property('page');
  });

  it('respects custom cursorParam (before)', () => {
    const pr = new PagedResults<any>();
    pr.paginationMode = 'cursor';
    pr.pageToken = 'X';
    const opts: Record<string, any> = {};
    pr.applyToRequest(opts, { kind: 'link-header-next', cursorParam: 'before' });
    expect(opts.before).to.equal('X');
    expect(opts).to.not.have.property('after');
  });

  it('offset mode: sets page from pageNumber', () => {
    const pr = new PagedResults<any>();
    pr.paginationMode = 'offset';
    pr.pageSize = 50;
    pr.pageNumber = 3;
    const opts: Record<string, any> = {};
    pr.applyToRequest(opts, contract);
    expect(opts.page).to.equal(3);
    expect(opts.per_page).to.equal(50);
  });

  it('cursor mode: extracts after from rel="next" link', () => {
    const pr = new PagedResults<any>();
    pr.paginationMode = 'cursor';
    pr.pageSize = 100;
    pr.consumeResponse({
      headers: { link: '<https://api.github.com/x?after=NEXT&per_page=100>; rel="next"' },
    }, contract);
    expect(pr.pageToken).to.equal('NEXT');
  });

  it('cursor mode: clears pageToken when no rel="next" present', () => {
    const pr = new PagedResults<any>();
    pr.paginationMode = 'cursor';
    pr.pageToken = 'STALE';
    pr.consumeResponse({
      headers: { link: '<https://api.github.com/x?before=PREV>; rel="prev"' },
    }, contract);
    expect(pr.pageToken).to.be.undefined;
  });

  it('cursor mode: clears pageToken when no Link header present', () => {
    const pr = new PagedResults<any>();
    pr.paginationMode = 'cursor';
    pr.pageToken = 'STALE';
    pr.consumeResponse({ headers: {} }, contract);
    expect(pr.pageToken).to.be.undefined;
  });

  it('offset mode: estimates count from rel="last"', () => {
    const pr = new PagedResults<any>();
    pr.paginationMode = 'offset';
    pr.pageSize = 100;
    pr.consumeResponse({
      headers: { link: '<https://api.github.com/x?page=10>; rel="last"' },
    }, contract);
    expect(pr.count).to.equal(1000);
  });

  it('offset mode: ignores non-numeric page in rel="last" (no NaN count)', () => {
    const pr = new PagedResults<any>();
    pr.paginationMode = 'offset';
    pr.pageSize = 100;
    pr.consumeResponse({
      headers: { link: '<https://api.github.com/x?page=abc>; rel="last"' },
    }, contract);
    expect(pr.count).to.be.undefined;
  });

  it('offset mode: no Link header is a no-op', () => {
    const pr = new PagedResults<any>();
    pr.paginationMode = 'offset';
    pr.pageSize = 100;
    pr.count = 500;
    pr.consumeResponse({ headers: {} }, contract);
    // Pre-existing count is preserved; no Link header means nothing to extract.
    expect(pr.count).to.equal(500);
  });

  it('cursor mode: respects non-standard cursorParam (e.g. starting_after)', () => {
    const pr = new PagedResults<any>();
    pr.paginationMode = 'cursor';
    pr.consumeResponse({
      headers: {
        link: '<https://x.test/items?starting_after=SA_VAL>; rel="next"',
      },
    }, { kind: 'link-header-next', cursorParam: 'starting_after' });
    expect(pr.pageToken).to.equal('SA_VAL');
  });

  it('cursor mode: contract cursorParam preference picked over default order', () => {
    // Vendor's rel="next" URL has both `cursor` and `after`; contract says
    // prefer `cursor`. Without honoring the contract's preference, default
    // order would extract `after` first.
    const pr = new PagedResults<any>();
    pr.paginationMode = 'cursor';
    pr.consumeResponse({
      headers: {
        link: '<https://x.test/items?after=AFTER_VAL&cursor=CURSOR_VAL>; rel="next"',
      },
    }, { kind: 'link-header-next', cursorParam: 'cursor' });
    expect(pr.pageToken).to.equal('CURSOR_VAL');
  });
});

describe('PagedResults.applyToRequest — page-number kind', () => {
  it('sets options.page from pageNumber and per_page from pageSize', () => {
    const pr = new PagedResults<any>();
    pr.pageNumber = 7;
    pr.pageSize = 25;
    const opts: Record<string, any> = {};
    pr.applyToRequest(opts, { kind: 'page-number' });
    expect(opts.page).to.equal(7);
    expect(opts.per_page).to.equal(25);
  });

  it('consumeResponse leaves pageToken untouched (offset semantics)', () => {
    const pr = new PagedResults<any>();
    // Pre-set a token to confirm it's not cleared by consumeResponse.
    pr.pageToken = 'PRESERVE';
    pr.consumeResponse(
      { headers: { 'x-ignored': 'value' }, data: { items: [] } },
      { kind: 'page-number' }
    );
    expect(pr.pageToken).to.equal('PRESERVE');
  });
});

describe('PagedResults.applyToRequest — pageSizeParam override', () => {
  it('uses configured pageSizeParam name in place of per_page', () => {
    const pr = new PagedResults<any>();
    pr.pageSize = 25;
    const opts: Record<string, any> = {};
    pr.applyToRequest(opts, { kind: 'page-number', pageSizeParam: 'limit' });
    expect(opts.limit).to.equal(25);
    expect(opts).to.not.have.property('per_page');
  });

  it('omits page size entirely when pageSizeParam is empty string', () => {
    const pr = new PagedResults<any>();
    pr.pageSize = 25;
    const opts: Record<string, any> = {};
    pr.applyToRequest(opts, { kind: 'page-number', pageSizeParam: '' });
    expect(opts).to.not.have.property('per_page');
    expect(opts).to.not.have.property('limit');
    expect(opts.page).to.equal(1);
  });
});

describe('PagedResults.applyToRequest / consumeResponse — body-token', () => {
  const awsContract: PaginationContract = { kind: 'body-token', tokenPath: 'NextToken' };
  const hubspotContract: PaginationContract = { kind: 'body-token', tokenPath: 'paging.next.after' };

  it('writes pageToken to body when set', () => {
    const pr = new PagedResults<any>();
    pr.pageToken = 'TOKEN_2';
    const opts: Record<string, any> = { body: { other: 'x' } };
    pr.applyToRequest(opts, awsContract);
    expect(opts.body).to.deep.include({ NextToken: 'TOKEN_2', other: 'x' });
  });

  it('creates body and intermediate objects for nested path', () => {
    const pr = new PagedResults<any>();
    pr.pageToken = 'C1';
    const opts: Record<string, any> = {};
    pr.applyToRequest(opts, hubspotContract);
    expect(opts.body.paging.next.after).to.equal('C1');
  });

  it('omits body write when pageToken is empty', () => {
    const pr = new PagedResults<any>();
    const opts: Record<string, any> = { body: { other: 'x' } };
    pr.applyToRequest(opts, awsContract);
    expect(opts.body.NextToken).to.be.undefined;
  });

  it('reads next token from response body and sets pageToken', () => {
    const pr = new PagedResults<any>();
    pr.consumeResponse({ data: { NextToken: 'NEW_TOKEN' } }, awsContract);
    expect(pr.pageToken).to.equal('NEW_TOKEN');
  });

  it('reads nested next token (HubSpot-style)', () => {
    const pr = new PagedResults<any>();
    pr.consumeResponse({ data: { paging: { next: { after: 'C5' } } } }, hubspotContract);
    expect(pr.pageToken).to.equal('C5');
  });

  it('clears pageToken when token absent in response', () => {
    const pr = new PagedResults<any>();
    pr.pageToken = 'STALE';
    pr.consumeResponse({ data: { results: [] } }, awsContract);
    expect(pr.pageToken).to.be.undefined;
  });
});

describe('PagedResults.applyToRequest / consumeResponse — body-url', () => {
  const contract: PaginationContract = { kind: 'body-url', urlPath: '@odata.nextLink' };

  it('overrides options.url with stored URL on subsequent requests', () => {
    const pr = new PagedResults<any>();
    pr.pageToken = 'https://graph.microsoft.com/v1.0/users?$skiptoken=ABC';
    const opts: Record<string, any> = { url: 'https://graph.microsoft.com/v1.0/users' };
    pr.applyToRequest(opts, contract);
    expect(opts.url).to.equal('https://graph.microsoft.com/v1.0/users?$skiptoken=ABC');
  });

  it('leaves caller-supplied url intact on first request (no pageToken)', () => {
    const pr = new PagedResults<any>();
    const opts: Record<string, any> = { url: 'https://graph.microsoft.com/v1.0/users' };
    pr.applyToRequest(opts, contract);
    expect(opts.url).to.equal('https://graph.microsoft.com/v1.0/users');
  });

  it('reads next URL from response body', () => {
    const pr = new PagedResults<any>();
    pr.consumeResponse({
      data: { '@odata.nextLink': 'https://graph.microsoft.com/v1.0/users?$skiptoken=Z' },
    }, contract);
    expect(pr.pageToken).to.equal('https://graph.microsoft.com/v1.0/users?$skiptoken=Z');
  });

  it('clears pageToken when nextLink absent', () => {
    const pr = new PagedResults<any>();
    pr.pageToken = 'STALE';
    pr.consumeResponse({ data: { value: [] } }, contract);
    expect(pr.pageToken).to.be.undefined;
  });
});

describe('PagedResults.applyToRequest / consumeResponse — header-token', () => {
  const contract: PaginationContract = { kind: 'header-token', headerName: 'x-next-cursor' };

  it('sets the configured header from pageToken', () => {
    const pr = new PagedResults<any>();
    pr.pageToken = 'CURSOR_2';
    const opts: Record<string, any> = {};
    pr.applyToRequest(opts, contract);
    expect(opts.headers['x-next-cursor']).to.equal('CURSOR_2');
  });

  it('removes the header when pageToken is empty', () => {
    const pr = new PagedResults<any>();
    const opts: Record<string, any> = { headers: { 'x-next-cursor': 'STALE', other: 'keep' } };
    pr.applyToRequest(opts, contract);
    expect(opts.headers).to.not.have.property('x-next-cursor');
    expect(opts.headers.other).to.equal('keep');
  });

  it('reads next cursor from response header', () => {
    const pr = new PagedResults<any>();
    pr.consumeResponse({ headers: { 'x-next-cursor': 'NEW' } }, contract);
    expect(pr.pageToken).to.equal('NEW');
  });

  it('clears pageToken when header absent', () => {
    const pr = new PagedResults<any>();
    pr.pageToken = 'STALE';
    pr.consumeResponse({ headers: {} }, contract);
    expect(pr.pageToken).to.be.undefined;
  });
});

describe('PagedResults.applyToRequest / consumeResponse — defensive', () => {
  it('throws InvalidStateError for an unknown contract kind (runtime guard)', () => {
    const pr = new PagedResults<any>();
    let applyErr: any;
    let consumeErr: any;
    try {
      pr.applyToRequest({}, { kind: 'made-up' as any });
    } catch (e) {
      applyErr = e;
    }
    try {
      pr.consumeResponse({}, { kind: 'made-up' as any });
    } catch (e) {
      consumeErr = e;
    }
    expect(applyErr).to.be.ok;
    expect(applyErr.message).to.match(/Unhandled PaginationContract kind/i);
    expect(consumeErr).to.be.ok;
    expect(consumeErr.message).to.match(/Unhandled PaginationContract kind/i);
  });
});

describe('PagedResults — cursor round-trip simulation', () => {
  // Simulates 3 pages of GitHub-style cursor pagination across multiple
  // producer invocations. Confirms the contract methods compose correctly:
  // request injection → response extraction → loop termination.
  function simulateRequest(after: string | undefined): { headers: Record<string, any>; data: any[] } {
    const pages: Record<string, { items: any[]; next: string | undefined }> = {
      undefined: { items: [{ number: 1 }, { number: 2 }], next: 'C1' },
      C1:        { items: [{ number: 3 }, { number: 4 }], next: 'C2' },
      C2:        { items: [{ number: 5 }],                next: undefined },
    };
    const key = after ?? 'undefined';
    const page = pages[key];
    const headers: Record<string, any> = {};
    if (page.next) {
      headers.link = `<https://api.github.com/x?after=${page.next}&per_page=100>; rel="next"`;
    }
    return { headers, data: page.items };
  }

  it('terminates after final page using applyToRequest/consumeResponse', () => {
    const contract: PaginationContract = { kind: 'link-header-next', cursorParam: 'after' };
    const pr = new PagedResults<any>();
    pr.paginationMode = 'cursor';
    pr.pageSize = 100;

    const all: any[] = [];
    let safety = 0;
    do {
      const opts: Record<string, any> = {};
      pr.applyToRequest(opts, contract);
      if (all.length === 0) {
        expect(opts).to.not.have.property('after');
      } else {
        expect(opts.after).to.be.a('string');
      }
      const resp = simulateRequest(opts.after);
      all.push(...resp.data);
      pr.consumeResponse(resp, contract);
      if (++safety > 10) throw new Error('runaway loop');
    } while (pr.pageToken);

    expect(all).to.have.length(5);
    expect(safety).to.equal(3);
  });
});

describe('PagedResults asyncGenerator guardrails', () => {
  // Builds a PagedResults whose fetchPage always returns the same content,
  // simulating a stuck cursor / non-advancing offset pager. We can't extend
  // the class because fetchPage is private — install the stub as an instance
  // property via `as any` instead.
  function makeStubOffset(stubPage: any[]) {
    const pr = new PagedResults<any>();
    pr.baseUrl = new URL('https://example.test/items');
    pr.paginationMode = 'offset';
    pr.pageSize = stubPage.length;
    pr.items = [...stubPage];
    const counter = { fetchCalls: 0 };
    (pr as any).fetchPage = async () => {
      counter.fetchCalls += 1;
      return stubPage;
    };
    return { pr, counter };
  }

  function makeStubCursor(opts: { totalPages?: number; resetCursor?: boolean }) {
    const pr = new PagedResults<any>();
    pr.baseUrl = new URL('https://example.test/items');
    pr.paginationMode = 'cursor';
    pr.pageSize = 1;
    pr.pageToken = 'INITIAL';
    const counter = { fetchCalls: 0 };
    (pr as any).fetchPage = async () => {
      counter.fetchCalls += 1;
      if (opts.totalPages && counter.fetchCalls >= opts.totalPages) {
        pr.pageToken = undefined;
      } else {
        pr.pageToken = `T${counter.fetchCalls}`;
      }
      return [{ id: counter.fetchCalls }];
    };
    return { pr, counter };
  }

  it('throws on duplicate consecutive pages by default (offset mode)', async () => {
    const { pr, counter } = makeStubOffset([{ id: 'A' }, { id: 'B' }]);

    let err: any;
    try {
      for await (const _ of pr) { /* drain */ }
    } catch (e) {
      err = e;
    }
    expect(err).to.be.instanceOf(UnexpectedError);
    expect(err.message).to.match(/duplicate page/i);
    // Should detect on the very first fetched page (matches the prefilled items).
    expect(counter.fetchCalls).to.equal(1);
  });

  it('detects duplicates on AWS-style PascalCase Name id', async () => {
    // Real-world: AWS S3 buckets, IAM roles. PascalCase keys must be
    // recognized by the case-insensitive id-key lookup or duplicate
    // detection silently does nothing for the largest body-token target.
    const { pr, counter } = makeStubOffset([{ Name: 'b1' }, { Name: 'b2' }]);
    pr.maxPages = 5;

    let err: any;
    try {
      for await (const _ of pr) { /* drain */ }
    } catch (e) {
      err = e;
    }
    expect(err).to.be.instanceOf(UnexpectedError);
    expect(err.message).to.match(/duplicate page/i);
    expect(counter.fetchCalls).to.equal(1);
  });

  it('does not throw on opaque items even when pages repeat (fail-safe)', async () => {
    // Items have no recognizable id key, so pageFingerprint returns
    // undefined and duplicate detection silently skips. maxPages still
    // bounds the iteration so the loop is not infinite.
    const { pr, counter } = makeStubOffset([{ misc: 'a' }, { misc: 'b' }]);
    pr.maxPages = 4;

    let err: any;
    try {
      for await (const _ of pr) { /* drain */ }
    } catch (e) {
      err = e;
    }
    // No duplicate-page throw; maxPages is the only safety net.
    expect(err).to.be.instanceOf(UnexpectedError);
    expect(err.message).to.match(/maxPages/i);
    expect(counter.fetchCalls).to.equal(4);
  });

  it('respects detectDuplicatePages=false (still bounded by maxPages)', async () => {
    const { pr, counter } = makeStubOffset([{ id: 'A' }, { id: 'B' }]);
    pr.maxPages = 5;
    pr.detectDuplicatePages = false;

    let err: any;
    try {
      for await (const _ of pr) { /* drain */ }
    } catch (e) {
      err = e;
    }
    expect(err).to.be.instanceOf(UnexpectedError);
    expect(err.message).to.match(/maxPages/i);
    expect(counter.fetchCalls).to.equal(5);
  });

  it('aborts cursor mode on maxPages even with non-duplicate content', async () => {
    const { pr, counter } = makeStubCursor({});
    pr.maxPages = 3;
    pr.detectDuplicatePages = false;

    let err: any;
    try {
      for await (const _ of pr) { /* drain */ }
    } catch (e) {
      err = e;
    }
    expect(err).to.be.instanceOf(UnexpectedError);
    expect(err.message).to.match(/maxPages/i);
    expect(counter.fetchCalls).to.equal(3);
  });

  it('maxPages=0 disables the cap', async () => {
    const { pr, counter } = makeStubCursor({ totalPages: 7 });
    pr.maxPages = 0;
    pr.detectDuplicatePages = false;

    const seen: any[] = [];
    for await (const item of pr) {
      seen.push(item);
    }
    expect(counter.fetchCalls).to.equal(7);
    expect(seen).to.have.length(7);
  });
});
