/* eslint-disable */
import { expect } from 'chai';
import {
  URL,
  PagedResults,
  PagedResultsColumnOptionsFilterType,
  IllegalArgumentError,
  InvalidInputError,
  UUID
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
