import { expect } from 'chai';
import { InvalidInputError } from '../../src/index.js';
import { Netmask } from '../../src/types/Netmask.js';

describe('Netmask', function () {

  it('should return a description of the class', async function () {
    const desc = Netmask.description();
    expect(desc).to.be.ok;
    expect(desc).to.include('A netmask');
  });

  it('should return examples for the class', async function () {
    const examples = Netmask.examples();
    expect(examples).to.be.ok;
  });

  it('should validate a valid netmask', async function () {
    const netmask = await Netmask.parse('255.255.255.0');
    expect(netmask).to.be.ok;
    expect(netmask instanceof Netmask).to.be.true;
    expect(netmask.toString()).to.be.eql('255.255.255.0');
  });

  it('should fail validation for an ivalid netmask', async function () {
    try {
      const a = await Netmask.parse('255.255.255.1');
    } catch (err) {
      expect(err).instanceOf(InvalidInputError);
      return;
    }
    expect.fail('Expected error not thrown');
  });

  it('should fail validation for an ivalid netmask with group > 255', async function () {
    try {
      const a = await Netmask.parse('255.255.256.0');
    } catch (err) {
      expect(err).instanceOf(InvalidInputError);
      return;
    }
    expect.fail('Expected error not thrown');
  });

  it('should fail validation for an ivalid netmask format', async function () {
    try {
      await Netmask.parse('my.invalid.netmask');
    } catch (err) {
      expect(err).instanceOf(InvalidInputError);
      return;
    }
    expect.fail('Expected error not thrown');
  });

  it('should validate a valid netmask using slash notation', async function () {
    const netmask = await Netmask.parse('/24');
    expect(netmask).to.be.ok;
    expect(netmask instanceof Netmask).to.be.true;
    expect(netmask.toString()).to.be.eql('255.255.255.0');
  });

  it('should fail validation for an ivalid netmask slash notation', async function () {
    try {
      await Netmask.parse('/33');
    } catch (err) {
      expect(err).instanceOf(InvalidInputError);
      return;
    }
    expect.fail('Expected error not thrown');
  });

  it('should return slash notation', async function () {
    const netmask = new Netmask('255.255.0.0');
    expect(netmask).instanceOf(Netmask);
    expect(netmask.toString()).eql('255.255.0.0');
    expect(netmask.slashNotation).eql('/16');
  });

  it('should return slash notation from slash notation input', async function () {
    const netmask = new Netmask('/8');
    expect(netmask).instanceOf(Netmask);
    expect(netmask.toString()).eql('255.0.0.0');
    expect(netmask.slashNotation).eql('/8');
  });

});
