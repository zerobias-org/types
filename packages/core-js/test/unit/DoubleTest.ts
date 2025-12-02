/* eslint-disable */
import { expect } from 'chai';
import { Double } from '../../src/types/Double.js';
import { InvalidInputError } from '../../src/errors/index.js';
import { CoreType, Type } from '../../src/index.js';

describe('Double', () => {
  it('should return a description of the class', () => {
    const desc = Double.description();
    expect(desc).to.be.ok;
    expect(desc).to.include('double');
  });

  it('should return examples for the class', () => {
    const examples = Double.examples();
    expect(examples).to.be.ok;
  });

  it('should validate a positive double number', async () => {
    const double = await Double.parse(1221.321221312231);
    expect(double).to.be.ok;
    expect(double instanceof Double).to.be.true;
    expect(double.toNumber()).to.equal(1221.321221312231);
  });

  it('should validate a negative double number', async () => {
    const double = await Double.parse(-902809.2121221);
    expect(double).to.be.ok;
    expect(double instanceof Double).to.be.true;
    expect(double.toNumber()).to.equal(-902809.2121221);
  });

  it('should validate a double number in e format', async () => {
    const double = await Double.parse(5.81216732323433E8);
    expect(double).to.be.ok;
    expect(double instanceof Double).to.be.true;
    expect(double.toNumber()).to.equal(5.81216732323433E8);
  });

  it('should throw InvalidInputError', async () => {
    try {
      await Double.parse(NaN);
      expect.fail();
    } catch (err) {
      expect(err).to.be.instanceOf(InvalidInputError);
    }
  });
 
  it('should have the proper HTML input type', async function () {
    const ct = CoreType.get('double');
    expect(ct.htmlInput).to.be.eq(Type.HtmlInputEnum.Number);
  });
});
