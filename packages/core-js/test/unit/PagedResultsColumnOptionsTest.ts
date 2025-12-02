/* eslint-disable */
import { expect } from 'chai';
import http, { Server } from 'http';
import path from 'path';
import { readFileSync } from 'fs';
import { URL as NodeURL } from 'url';
import {
  URL,
  PagedResults,
  PagedResultsColumnOptionsDef,
  PagedResultsColumnOptionsFilterType,
  PagedResultsSearchColumnOptionsDef,
  UUID
} from '../../src/index.js';

let server: Server;
const port = process.env.PORT || 4000;
const contents = readFileSync(path.join(__dirname, 'got.json'));
const json = JSON.parse(contents.toString());
const CHARACTERS = json.characters;
console.info('Testing with %s Game of Thrones characters', CHARACTERS.length);

const delay = ms => new Promise(res => setTimeout(res, ms));

interface TestType {
  id: string,
  name: string,
  description: string,
  test: string,
  testResource: string,
}

describe('PagedResults Column Options', () => {
  before('setup', async () => {
    const requestHandler = function (req, res) {
      if (req.url.toString() === `/search/options`) {
        const url = new NodeURL(req.url, `http://localhost:${port}/search/options`);
        res.setHeader('Content-Type', 'application/json');
        // drop a 503 in there 10% of the time
        if (!url.searchParams.get('stable') && (Math.random() * 10) <= 1) {
          // console.info('Returing 503');
          res.writeHead(503);
          res.end(JSON.stringify({ err: 'Chaos monkey strikes again' }));
        } else {
          // console.info('Returing 200');
          res.writeHead(200);
          const columnOptions: Record<string, PagedResultsColumnOptionsDef> = {
            id: {
              sortable: false,
              searchable: false,
              filterable: false,
            },
            name: {
              sortable: true,
              searchable: true,
              filterable: false,
            },
            filterableString: {
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
            },
            filterableResource: {
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
            }
          };
          res.end(JSON.stringify({ options: columnOptions }));
        }
      } else if (req.url.toString().includes(`/search/searchOptions?`)) {
        const url = new NodeURL(req.url, `http://localhost:${port}/search/searchOptions`);
        res.setHeader('Content-Type', 'application/json');
        // drop a 503 in there 10% of the time
        if (!url.searchParams.get('stable') && (Math.random() * 10) <= 1) {
          // console.info('Returing 503');
          res.writeHead(503);
          res.end(JSON.stringify({ err: 'Chaos monkey strikes again' }));
        } else {
          const params = url.searchParams;
          if (!params.get('columnName')) {
            res.writeHead(400);
            res.end(JSON.stringify({ err: 'Missing required query param columnName' }));
          } else if (!params.get('search')) {
            res.writeHead(400);
            res.end(JSON.stringify({ err: 'Missing required query param search' }));
          } else {
            // console.info('Returing 200');
            if (params.get('columnName') === 'test1') {
              res.writeHead(200);
              if (params.get('search') === 'test1') {
                const columnOptions: PagedResultsSearchColumnOptionsDef = {
                  searchOptions: [
                    {
                      id: UUID.generateV4(),
                      name: 'test1',
                    },
                  ]
                };
                res.end(JSON.stringify({ searchOptions: columnOptions }));
              } else {
                const columnOptions: PagedResultsSearchColumnOptionsDef = {
                  searchOptions: []
                };
                res.end(JSON.stringify({ searchOptions: columnOptions }));
              }
            } else if (params.get('columnName') === 'test2') {
              res.writeHead(200);
              const columnOptions: PagedResultsSearchColumnOptionsDef = {
                searchOptions: [
                  {
                    id: UUID.generateV4(),
                    name: 'test1',
                  },
                  {
                    id: UUID.generateV4(),
                    name: 'test2',
                  }
                ]
              };
              res.end(JSON.stringify({ searchOptions: columnOptions }));
            } else {
              res.writeHead(400);
              res.end(JSON.stringify({ err: 'Column not supported for search options' }));
            }
          }
        }
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ err: 'Endpoint not found' }));
      }
    };

    server = http.createServer(requestHandler);
    
    server.listen(port, () => {
      console.log(`Server is listening on ${port}`);
    });
    
    // give it a little time to settle
    await delay(100);
  });

  it('should fetch column options', async () => {
    const pr = new PagedResults<TestType>();
    pr.baseUrl = new URL(`http://localhost:${port}/search`)
    const columnOptions = await pr.getColumnOptions()
      .catch((error: any) => Promise.reject(error.message));

    expect(columnOptions).to.be.ok;
    expect(columnOptions).to.be.not.undefined;
    expect(Object.keys(columnOptions).length).to.be.eq(4);
    expect(columnOptions['fake']).to.be.undefined;
    expect(columnOptions['id']).to.be.not.undefined;
    expect(columnOptions['name']).to.be.not.undefined;
    expect(columnOptions['filterableString']).to.be.not.undefined;
    expect(columnOptions['filterableResource']).to.be.not.undefined;
    expect(columnOptions['id'].sortable).to.be.false;
    expect(columnOptions['id'].searchable).to.be.false;
    expect(columnOptions['id'].filterable).to.be.false;
    expect(columnOptions['name'].sortable).to.be.true;
    expect(columnOptions['name'].searchable).to.be.true;
    expect(columnOptions['name'].filterable).to.be.false;
    expect(columnOptions['filterableString'].sortable).to.be.false;
    expect(columnOptions['filterableString'].searchable).to.be.true;
    expect(columnOptions['filterableString'].filterable).to.be.true;
    expect(columnOptions['filterableString'].filter).to.be.not.undefined;
    expect(columnOptions['filterableString'].filter?.multi).to.be.true;
    expect(columnOptions['filterableString'].filter?.type).to.be.eq(PagedResultsColumnOptionsFilterType.String);
    expect(columnOptions['filterableString'].filter?.options.length).to.be.eq(2);
    expect(columnOptions['filterableString'].filter?.options[0]).to.be.eq('test1');
    expect(columnOptions['filterableResource'].sortable).to.be.true;
    expect(columnOptions['filterableResource'].searchable).to.be.false;
    expect(columnOptions['filterableResource'].filterable).to.be.true;
    expect(columnOptions['filterableResource'].filter).to.be.not.undefined;
    expect(columnOptions['filterableResource'].filter?.multi).to.be.false;
    expect(columnOptions['filterableResource'].filter?.type).to.be.eq(PagedResultsColumnOptionsFilterType.Resource);
    expect(columnOptions['filterableResource'].filter?.options.length).to.be.eq(2);
    expect(columnOptions['filterableResource'].filter?.options[0]['name']).to.be.eq('test1');
  }).timeout(30000);

  it('should fail fetch column options', async () => {
    const pr = new PagedResults<TestType>();
    pr.baseUrl = new URL(`http://localhost:${port}/searching`)
    const columnOptions = await pr.getColumnOptions()
      .catch(() => undefined);

    expect(columnOptions).to.be.undefined;
  }).timeout(30000);

  it('should search column options', async () => {
    const pr = new PagedResults<TestType>();
    pr.baseUrl = new URL(`http://localhost:${port}/search`)
    let searchColumnOptions = await pr.getSearchColumnOptions('test1', 'test1')
      .catch((error: any) => Promise.reject(error.message));

    expect(searchColumnOptions).to.be.ok;
    expect(searchColumnOptions).to.be.not.undefined;
    expect(searchColumnOptions.searchOptions.length).to.be.eq(1);
    expect(searchColumnOptions.searchOptions[0]['name']).to.be.eq('test1');

    console.log(searchColumnOptions);
    searchColumnOptions = await pr.getSearchColumnOptions('test1', 'test')
      .catch((error: any) => Promise.reject(error.message));

    console.log(searchColumnOptions);
    expect(searchColumnOptions).to.be.ok;
    expect(searchColumnOptions).to.be.not.undefined;
    expect(searchColumnOptions.searchOptions.length).to.be.eq(0);

    console.log(searchColumnOptions);
    searchColumnOptions = await pr.getSearchColumnOptions('test2', 'test1')
      .catch((error: any) => Promise.reject(error.message));

    expect(searchColumnOptions).to.be.ok;
    expect(searchColumnOptions).to.be.not.undefined;
    expect(searchColumnOptions.searchOptions.length).to.be.eq(2);
    expect(searchColumnOptions.searchOptions[0]['name']).to.be.eq('test1');
    expect(searchColumnOptions.searchOptions[1]['name']).to.be.eq('test2');

    await pr.getSearchColumnOptions('test', 'test1')
      .then(() => {
        expect(false);
      })
      .catch((error: any) => Promise.reject(error.message));
  }).timeout(30000);

  after('teardown', () => {
    if (server) {
      server.close();
    }
  });
});
