/* eslint-disable */
import { expect } from 'chai';
import http, { Server } from 'http';
import axios from 'axios';
import path from 'path';
import { readFileSync } from 'fs';
import { URL as NodeURL } from 'url';
import { URL, PagedResults, InvalidInputError, PaginationMode, HttpMethod, UnexpectedError } from '../../src/index.js';

let server: Server;
let cursorServer: Server;
const port = process.env.PORT || 9876;
const cursorPort = Number(port) + 1;
const contents = readFileSync(path.join(__dirname, 'got.json'));
const json = JSON.parse(contents.toString());
const CHARACTERS = json.characters;
console.info('Testing with %s Game of Thrones characters', CHARACTERS.length);

const delay = ms => new Promise(res => setTimeout(res, ms));

describe('PagedResults Pagination', () => {
  before('setup', async () => {
    const requestHandler = function (req, res) {
      const url = new NodeURL(req.url, `http://localhost:${port}/`);
      const pageNumber = Number(url.searchParams.get('pageNumber') || 0);
      const pageSize = Number(url.searchParams.get('pageSize') || 0);
      const first = (pageNumber - 1) * pageSize;
      let last = first + pageSize;
      if (last > CHARACTERS.length) {
        last = CHARACTERS.length;
      }
      res.setHeader('Content-Type', 'application/json');
      if ((Math.random() * 10) <= 5) {
        res.setHeader('count', CHARACTERS.length);
      }
      // drop a 503 in there 10% of the time
      if (!url.searchParams.get('stable') && (Math.random() * 10) <= 1) {
        // console.info('Returing 503');
        res.writeHead(503);
        res.end(JSON.stringify({ err: 'Chaos monkey strikes again' }));
      } else {
        // console.info('Returing 200');
        res.writeHead(200);
        res.end(JSON.stringify(CHARACTERS.slice(first, last)));
      }
    };

    server = http.createServer(requestHandler);
    
    server.listen(port, () => {
        console.log(`Server is listening on ${port}`);
    });
    
    // give it a little time to settle
    await delay(100);
  });

  it('should iterate over a remote result set', async () => {
    // get first page - this is boilerplate that will be in generated code
    const characters = await axios.get(`http://localhost:${port}?pageSize=20&pageNumber=1&stable=true`)
      .then((resp) => {
        const pr = PagedResults.fromArray(resp.data, 1, 20, resp.headers.count ? Number(resp.headers.count) : -1);
        pr.baseUrl = new URL(`http://localhost:${port}?pageSize=20&pageNumber=1`)
        pr.count = undefined;
        return pr;
      });
    let count = 0;
    // iterate through them all
    for await (const char of characters) {
      expect(char).to.be.deep.eq(CHARACTERS[count++]);
    }
    expect(count).to.be.eq(CHARACTERS.length);
  }).timeout(30000);

  it('should iterate over a remote result set via foreach', async () => {
    // get first page - this is boilerplate that will be in generated code
    const characters = await axios.get(`http://localhost:${port}?pageSize=20&pageNumber=1&stable=true`)
      .then((resp) => {
        const pr = PagedResults.fromArray(resp.data, 1, 20, resp.headers.count ? Number(resp.headers.count) : -1);
        pr.baseUrl = new URL(`http://localhost:${port}?pageSize=20&pageNumber=1`)
        pr.count = undefined;
        return pr;
      });
    let count = 0;
    await characters.forEach(async (char) => { 
      expect(char).to.be.deep.eq(CHARACTERS[count++]);
    });
    expect(count).to.be.eq(CHARACTERS.length);
  }).timeout(30000);

  it('should iterate over a remote result set via foreach using limit', async () => {
    // get first page - this is boilerplate that will be in generated code
    const limit = 10;
    const characters = await axios.get(`http://localhost:${port}?pageSize=20&pageNumber=1&stable=true`)
      .then((resp) => {
        const pr = PagedResults.fromArray(resp.data, 1, 20, resp.headers.count ? Number(resp.headers.count) : -1);
        pr.baseUrl = new URL(`http://localhost:${port}?pageSize=20&pageNumber=1`)
        pr.count = undefined;
        return pr;
      });
    let count = 0;
    await characters.forEach(async (char) => { 
      expect(char).to.be.deep.eq(CHARACTERS[count++]);
    }, undefined, limit);
    expect(count).to.be.eq(limit);
  }).timeout(30000);

  it('should throw an error for invalid limit', async () => {
    // get first page - this is boilerplate that will be in generated code
    const limit = 0;
    const characters = await axios.get(`http://localhost:${port}?pageSize=20&pageNumber=1&stable=true`)
      .then((resp) => {
        const pr = PagedResults.fromArray(resp.data, 1, 20, resp.headers.count ? Number(resp.headers.count) : -1);
        pr.baseUrl = new URL(`http://localhost:${port}?pageSize=20&pageNumber=1`)
        pr.count = undefined;
        return pr;
      });
    let count = 0;
    try{
      await characters.forEach(async (char) => { 
      }, undefined, limit);
    }
    catch (e) {
      expect(e instanceof InvalidInputError).to.be.true;
    }
  
    expect(count).to.be.eq(limit);
  }).timeout(30000);

  after('teardown', () => {
    if (server) {
      server.close();
    }
  });
});

describe('PagedResults Cursor-Based Pagination', () => {
  // Map to track cursor state - simulates server-side cursor tracking
  const cursorState = new Map<string, number>();

  before('setup cursor server', async () => {
    const cursorRequestHandler = function (req, res) {
      const url = new NodeURL(req.url, `http://localhost:${cursorPort}/`);
      const pageSize = Number(url.searchParams.get('pageSize') || 20);
      const pageToken = url.searchParams.get('pageToken');
      const pageNumber = url.searchParams.get('pageNumber');

      // Determine starting position
      let startIndex = 0;
      if (pageToken) {
        // Cursor-based: decode token to get position
        startIndex = parseInt(Buffer.from(pageToken, 'base64').toString(), 10);
      } else if (pageNumber) {
        // Offset-based fallback
        startIndex = (Number(pageNumber) - 1) * pageSize;
      }

      let endIndex = startIndex + pageSize;
      if (endIndex > CHARACTERS.length) {
        endIndex = CHARACTERS.length;
      }

      res.setHeader('Content-Type', 'application/json');

      // Set pageToken header for next page (if more items exist)
      if (endIndex < CHARACTERS.length) {
        const nextToken = Buffer.from(endIndex.toString()).toString('base64');
        res.setHeader('pagetoken', nextToken);
      }

      res.writeHead(200);
      res.end(JSON.stringify(CHARACTERS.slice(startIndex, endIndex)));
    };

    cursorServer = http.createServer(cursorRequestHandler);

    cursorServer.listen(cursorPort, () => {
      console.log(`Cursor server is listening on ${cursorPort}`);
    });

    // give it a little time to settle
    await delay(100);
  });

  it('should iterate over a cursor-based result set', async () => {
    // Get first page
    const characters = await axios.get(`http://localhost:${cursorPort}?pageSize=20`)
      .then((resp) => {
        const pr = PagedResults.fromArray(resp.data, 1, 20, undefined, resp.headers.pagetoken);
        pr.baseUrl = new URL(`http://localhost:${cursorPort}`);
        pr.paginationMode = 'cursor';
        return pr;
      });

    let count = 0;
    // iterate through them all
    for await (const char of characters) {
      expect(char).to.be.deep.eq(CHARACTERS[count++]);
    }
    expect(count).to.be.eq(CHARACTERS.length);
  }).timeout(30000);

  it('should auto-detect cursor mode from pageToken header', async () => {
    // Get first page - let auto-detection work
    const characters = await axios.get(`http://localhost:${cursorPort}?pageSize=20`)
      .then((resp) => {
        const pr = PagedResults.fromArray(resp.data, 1, 20, undefined, resp.headers.pagetoken);
        pr.baseUrl = new URL(`http://localhost:${cursorPort}`);
        // paginationMode is 'auto' by default
        expect(pr.paginationMode).to.be.eq('auto');
        return pr;
      });

    let count = 0;
    for await (const char of characters) {
      count++;
    }
    expect(count).to.be.eq(CHARACTERS.length);
  }).timeout(30000);

  it('should only send pageToken in cursor mode (not both)', async () => {
    // This test verifies the smart parameter selection
    let requestCount = 0;
    let lastParams: URLSearchParams | null = null;

    const testServer = http.createServer((req, res) => {
      const url = new NodeURL(req.url || '/', `http://localhost:${cursorPort + 100}/`);
      lastParams = url.searchParams;
      requestCount++;

      const pageSize = Number(url.searchParams.get('pageSize') || 20);
      const hasPageToken = url.searchParams.has('pageToken');
      const hasPageNumber = url.searchParams.has('pageNumber');

      // Verify mutual exclusivity: only one should be present after first request
      if (requestCount > 1 && hasPageToken) {
        expect(hasPageNumber).to.be.false;
      }

      res.setHeader('Content-Type', 'application/json');
      if (requestCount < 3) {
        res.setHeader('pagetoken', `token-${requestCount + 1}`);
      }
      res.writeHead(200);
      res.end(JSON.stringify([{ id: requestCount }]));
    });

    await new Promise<void>(resolve => testServer.listen(cursorPort + 100, () => resolve()));

    const pr = PagedResults.fromArray([{ id: 1 }], 1, 1, undefined, 'token-1');
    pr.baseUrl = new URL(`http://localhost:${cursorPort + 100}`);
    pr.paginationMode = 'cursor';

    let count = 0;
    for await (const item of pr) {
      count++;
      if (count >= 3) break; // Limit iterations for test
    }

    testServer.close();
    expect(requestCount).to.be.greaterThan(1);
  }).timeout(30000);

  it('should serialize and deserialize paginationMode', () => {
    const pr = new PagedResults<{ id: number }>();
    pr.paginationMode = 'cursor';
    pr.pageToken = 'test-token';

    const json = pr.toJSON();
    expect(json.paginationMode).to.be.eq('cursor');
    expect(json.pageToken).to.be.eq('test-token');

    const restored = PagedResults.newInstance(json, (obj) => obj);
    expect(restored.paginationMode).to.be.eq('cursor');
    expect(restored.pageToken).to.be.eq('test-token');
  });

  it('should use offset mode when paginationMode is explicitly set', async () => {
    // Use cursor server but force offset mode - server supports both
    const characters = await axios.get(`http://localhost:${cursorPort}?pageSize=20&pageNumber=1`)
      .then((resp) => {
        const pr = PagedResults.fromArray(resp.data, 1, 20);
        pr.baseUrl = new URL(`http://localhost:${cursorPort}`);
        pr.paginationMode = 'offset'; // Explicitly set offset mode
        return pr;
      });

    let count = 0;
    for await (const char of characters) {
      expect(char).to.be.deep.eq(CHARACTERS[count++]);
    }
    expect(count).to.be.eq(CHARACTERS.length);
  }).timeout(30000);

  after('teardown cursor server', () => {
    if (cursorServer) {
      cursorServer.close();
    }
  });
});

describe('PagedResults Wrapped Response Body', () => {
  let wrappedServer: Server;
  const wrappedPort = Number(port) + 50;
  let badShapeServer: Server;
  const badShapePort = Number(port) + 51;

  before('setup wrapped response server', async () => {
    // Mimics PUT/POST-paginated endpoints (e.g. AWS Inspector searchFindings)
    // that return a wrapped body {items, pageToken} instead of a raw array.
    const handler = (req, res) => {
      let raw = '';
      req.on('data', (chunk) => { raw += chunk; });
      req.on('end', () => {
        const body = raw ? JSON.parse(raw) : {};
        const pageSize = Number(body.pageSize || 20);
        const startIndex = body.pageToken
          ? parseInt(Buffer.from(body.pageToken, 'base64').toString(), 10)
          : 0;
        const endIndex = Math.min(startIndex + pageSize, CHARACTERS.length);
        const nextToken = endIndex < CHARACTERS.length
          ? Buffer.from(endIndex.toString()).toString('base64')
          : undefined;

        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({
          items: CHARACTERS.slice(startIndex, endIndex),
          pageToken: nextToken,
        }));
      });
    };
    wrappedServer = http.createServer(handler);
    await new Promise<void>((resolve) => wrappedServer.listen(wrappedPort, () => resolve()));

    const badHandler = (_req, res) => {
      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.end('<html><body>not json</body></html>');
    };
    badShapeServer = http.createServer(badHandler);
    await new Promise<void>((resolve) => badShapeServer.listen(badShapePort, () => resolve()));

    await delay(100);
  });

  it('iterates over a PUT-paginated wrapped response body', async () => {
    // Simulate what a hub-impl does after the first page lands: it
    // already extracted items + pageToken from the first response and
    // primes the pager for follow-up fetches.
    const firstResp = await axios.put(
      `http://localhost:${wrappedPort}`,
      { pageSize: 20 }
    );
    const pr = new PagedResults<any>();
    pr.items = firstResp.data.items;
    pr.pageToken = firstResp.data.pageToken;
    pr.pageSize = 20;
    pr.baseUrl = new URL(`http://localhost:${wrappedPort}`);
    pr.httpMethod = HttpMethod.Put;
    pr.body = {};
    pr.paginationMode = 'cursor';

    let count = 0;
    for await (const char of pr) {
      expect(char).to.be.deep.eq(CHARACTERS[count++]);
    }
    expect(count).to.be.eq(CHARACTERS.length);
  }).timeout(30000);

  it('throws a clear error when response is neither array nor wrapped', async () => {
    const pr = new PagedResults<any>();
    pr.items = [{ stub: true }];
    pr.pageToken = 'continue';
    pr.pageSize = 20;
    pr.baseUrl = new URL(`http://localhost:${badShapePort}`);
    pr.httpMethod = HttpMethod.Put;
    pr.body = {};
    pr.paginationMode = 'cursor';

    let caught: unknown;
    try {
      for await (const _ of pr) { /* consume */ }
    } catch (e) {
      caught = e;
    }
    expect(caught).to.be.instanceOf(UnexpectedError);
    expect((caught as Error).message).to.match(/not paginatable/);
  }).timeout(30000);

  after('teardown', () => {
    if (wrappedServer) wrappedServer.close();
    if (badShapeServer) badShapeServer.close();
  });
});
