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

  it('should validate IPv4-mapped IPv6 address (short form)', async function () {
    const ip = await IpAddress.parse('::ffff:127.0.0.1');
    expect(ip).to.be.ok;
    expect(ip.isV4()).to.be.true;
    expect(ip.toString()).to.equal('127.0.0.1');
  });

  it('should validate IPv4-mapped IPv6 address (full form)', async function () {
    const ip = await IpAddress.parse('0:0:0:0:0:ffff:192.168.1.1');
    expect(ip).to.be.ok;
    expect(ip.isV4()).to.be.true;
    expect(ip.toString()).to.equal('192.168.1.1');
  });

  it('should validate IPv4-mapped IPv6 address (hex notation)', async function () {
    // ::ffff:7f00:1 is 127.0.0.1 in hex
    const ip = await IpAddress.parse('::ffff:7f00:1');
    expect(ip).to.be.ok;
    expect(ip.isV4()).to.be.true;
    expect(ip.toString()).to.equal('127.0.0.1');
  });

  it('should validate IPv4-mapped IPv6 address (full hex form)', async function () {
    // 0:0:0:0:0:ffff:c0a8:101 is 192.168.1.1 in hex
    const ip = await IpAddress.parse('0:0:0:0:0:ffff:c0a8:101');
    expect(ip).to.be.ok;
    expect(ip.isV4()).to.be.true;
    expect(ip.toString()).to.equal('192.168.1.1');
  });

  it('should validate IPv4-compatible IPv6 address', async function () {
    const ip = await IpAddress.parse('::192.168.1.1');
    expect(ip).to.be.ok;
    expect(ip.isV4()).to.be.true;
    expect(ip.toString()).to.equal('192.168.1.1');
  });

  it('should handle IPv6 with zone ID', async function () {
    const ip = await IpAddress.parse('fe80::1%eth0');
    expect(ip).to.be.ok;
    expect(ip.isV6()).to.be.true;
    // Zone ID should be stripped from the stored value
    expect(ip.toString()).to.not.include('%');
  });

  it('should handle IPv6 link-local with zone ID', async function () {
    const ip = await IpAddress.parse('fe80::a00:27ff:fe8e:8aa8%enp0s3');
    expect(ip).to.be.ok;
    expect(ip.isV6()).to.be.true;
  });

  it('should correctly identify IPv4 vs IPv6', async function () {
    const v4 = await IpAddress.parse('10.0.0.1');
    expect(v4.isV4()).to.be.true;
    expect(v4.isV6()).to.be.false;

    const v6 = await IpAddress.parse('2001:db8::1');
    expect(v6.isV4()).to.be.false;
    expect(v6.isV6()).to.be.true;
  });

  it('should test equality correctly', async function () {
    const ip1 = await IpAddress.parse('192.168.1.1');
    const ip2 = await IpAddress.parse('192.168.1.1');
    const ip3 = await IpAddress.parse('192.168.1.2');

    expect(ip1.equals(ip2)).to.be.true;
    expect(ip1.equals(ip3)).to.be.false;
    expect(ip1.equals(null)).to.be.false;
    expect(ip1.equals('192.168.1.1')).to.be.false;
  });

});
