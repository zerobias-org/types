/* eslint-disable */
import { expect } from 'chai';
import { Nmtoken } from '../../src/types/index.js';
import { InvalidInputError } from '../../src/index.js';

describe('Nmtoken', function () {
  it('should return a description of the class', async function () {
    const desc = Nmtoken.description();
    expect(desc).to.be.ok;
    expect(desc).to.include('NMTOKEN');
  });

  it('should return examples for the class', async function () {
    const examples = Nmtoken.examples();
    expect(examples).to.be.ok;
  });

  it('should validate a valid token with dots', async function () {
    const token = await Nmtoken.parse('www.google.com');
    expect(token).to.be.ok;
    expect(token instanceof Nmtoken).to.be.true;
  });

  it('should validate a valid token with hyphens', async function () {
    const token = await Nmtoken.parse('foo-bar-baz');
    expect(token).to.be.ok;
    expect(token instanceof Nmtoken).to.be.true;
  });

  it('should validate a valid token with underscores', async function () {
    const token = await Nmtoken.parse('foo_bar_baz');
    expect(token).to.be.ok;
    expect(token instanceof Nmtoken).to.be.true;
  });

  it('should validate a valid token without separators', async function () {
    const token = await Nmtoken.parse('github');
    expect(token).to.be.ok;
    expect(token instanceof Nmtoken).to.be.true;
  });

  it('should validate a token starting with a numeral', async function () {
    const token = await Nmtoken.parse('0a');
    expect(token).to.be.ok;
    expect(token instanceof Nmtoken).to.be.true;
  });

  it('should validate a token that is all numerals', async function () {
    const token = await Nmtoken.parse('00000');
    expect(token).to.be.ok;
    expect(token instanceof Nmtoken).to.be.true;
  });

  it('should reject a token with invalid characters', async function () {
    try {
      await Nmtoken.parse('aoeu$');
      expect.fail('Should not parse an nmtoken containing a dollar sign');
    } catch (e) {
      expect(e instanceof InvalidInputError).to.be.true;
    }
  });
});
