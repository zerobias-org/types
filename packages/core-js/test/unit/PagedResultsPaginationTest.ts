/* eslint-disable */
import { expect } from 'chai';
import http, { Server } from 'http';
import axios from 'axios';
import path from 'path';
import { readFileSync } from 'fs';
import { URL as NodeURL } from 'url';
import { URL, PagedResults, InvalidInputError } from '../../src/index.js';

let server: Server;
const port = process.env.PORT || 9876;
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
