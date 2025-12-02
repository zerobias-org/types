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

const json = require('./got.json');
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
