 
import { expect } from 'chai';
import { CoreType, Type } from '../../src/index.js';
import { URL } from '../../src/types/URL.js';

describe('URL', function () {
  it('should return a description of the class', async function () {
    const desc = URL.description().toUpperCase();
    expect(desc).to.be.ok;
    expect(desc).to.include('URL');
  });

  it('should return examples for the class', async function () {
    const examples = URL.examples();
    expect(examples).to.be.ok;
  });

  it('should validate a valid url', async function () {
    const url = await URL.parse('https://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash');
    expect(url).to.be.ok;
    expect(url instanceof URL).to.be.true;
  });

  it('should access protocol, hostname and port at least', async function () {
    const urlInstance = new URL('https://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash');
    expect(urlInstance.protocol).to.equal('https');
    expect(urlInstance.hostname).to.equal('sub.example.com');
    expect(urlInstance.port).to.equal('8080');
  });

  it('should check equality for two instances', async function () {
    const firstInstance = await URL.parse('https://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash');
    const secondInstance = await URL.parse('https://user:pass@sub.example.com:8080');
    const equals = firstInstance.equals(secondInstance);
    expect(equals).to.be.false;
  });

  it('should return a string representation of URL object', async function () {
    const urlInstance = new URL('https://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash');
    const urlString: any = urlInstance.toString();
    expect(urlString).to.be.ok;
    expect(urlString).to.be.a('string');
  });

  it('should parse a relative URL without a leading slash', async function () {
    const str = 'this/is/relative';
    const u = await URL.parse(str);
    expect(u).to.be.ok;
    expect(u.relative).to.be.true;
    expect(u.toString()).to.be.eq(str);
  });

  it('should parse a relative URL', async function () {
    const u = await URL.parse('/this/is/relative');
    expect(u).to.be.ok;
    expect(u.relative).to.be.true;
  });

  it('should not return a protocol for a relative URL', async function () {
    const u = await URL.parse('/this/is/relative');
    expect(u).to.be.ok;
    expect(u.protocol).to.be.eq('');
  });

  it('should not return a port for a relative URL', async function () {
    const u = await URL.parse('/this/is/relative');
    expect(u).to.be.ok;
    expect(u.port).to.be.eq('');
  });

  it('should not return a host for a relative URL', async function () {
    const u = await URL.parse('/this/is/relative');
    expect(u).to.be.ok;
    expect(u.host).to.be.eq('');
    expect(u.hostname).to.be.eq('');
  });

  it('should retain the path, search, and hash for a relative URL', async function () {
    const str = '/this/is/relative?with=a&search=true#andHash';
    const u = await URL.parse(str);
    expect(u).to.be.ok;
    expect(u.toString()).to.be.eq(str);
    expect(u.search).to.be.ok;
    expect(u.searchParams).to.be.ok;
    expect(u.searchParams.get('with')).to.be.equal('a');
    expect(u.searchParams.get('search')).to.be.equal('true');
    expect(u.hash).to.be.ok;
  });

  it('should parse a url with unencoded query parameters', async function () {
    const url = await URL.parse('https://user:pass@sub.example.com:8080/p/a/t/h?query=string and stuff');
    expect(url).to.be.ok;
    expect(url instanceof URL).to.be.true;
    expect(url.search).to.include('%');
    expect(url.searchParams).to.be.ok;
    expect(url.searchParams.get('query')).to.be.equal('string and stuff');
  });

  it('should have the proper HTML input type', async function () {
    const ct = CoreType.get('url');
    expect(ct.htmlInput).to.be.eq(Type.HtmlInputEnum.Url);
  });
});
