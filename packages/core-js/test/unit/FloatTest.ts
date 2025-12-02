/* eslint-disable */
import { expect } from 'chai';
import { Float } from '../../src/types/Float.js';
import { Double } from '../../src/types/index.js';
import { InvalidInputError } from '../../src/errors/index.js';
import { CoreType, Type } from '../../src/index.js';

describe('Float', () => {
  it('should return a description of the class', () => {
    const desc = Float.description();
    expect(desc).to.be.ok;
    expect(desc).to.include('float');
  });

  it('should return examples for the class', () => {
    const examples = Float.examples();
    expect(examples).to.be.ok;
  });

  it('should validate a positive float number', async () => {
    const float = await Float.parse(1221.321221);
    expect(float).to.be.ok;
    expect(float instanceof Float).to.be.true;
    expect(float.toNumber()).to.equal(1221.321221);
  });

  it('should validate a negative float number', async () => {
    const float = await Float.parse(-1221.112);
    expect(float).to.be.ok;
    expect(float instanceof Float).to.be.true;
    expect(float.toNumber()).to.equal(-1221.112);
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
    const ct = CoreType.get('float');
    expect(ct.htmlInput).to.be.eq(Type.HtmlInputEnum.Number);
  });
});
