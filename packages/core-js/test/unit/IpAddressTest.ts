import { expect } from 'chai';
import { IpAddress } from '../../src/types/IpAddress.js';
import { InvalidInputError } from '../../src/index.js';

describe('IpAddress', function () {

  it('should return a description of the class', async function () {
    const desc = IpAddress.description();
    expect(desc).to.be.ok;
    expect(desc).to.include('IPv4');
  });

  it('should return examples for the class', async function () {
    const examples = IpAddress.examples();
    expect(examples).to.be.ok;
  });

  it('should validate a valid IPv4 address', async function () {
    const ip = await IpAddress.parse('127.0.0.1');
    expect(ip).to.be.ok;
    expect(ip instanceof IpAddress).to.be.true;
  });

  it('should validate a valid IPv6 address', async function () {
    const ip = await IpAddress.parse('::1');
    expect(ip).to.be.ok;
    expect(ip instanceof IpAddress).to.be.true;
  });

  it('should reject a random string', async function () {
    try {
      await IpAddress.parse(Math.random().toString(36));
      expect.fail('Should not parse a random string');
    } catch (e) {
      expect(e instanceof InvalidInputError).to.be.true;
    }
  });

});
