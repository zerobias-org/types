 
import { expect } from 'chai';
import { Byte, InvalidInputError } from '../../src/index.js';

describe('Byte', function () {
  it('should return a description of the class', async function () {
    const desc = Byte.description();
    expect(desc).to.be.ok;
    expect(desc).to.include('Base64');
  });

  it('should return examples for the class', async function () {
    const examples = Byte.examples();
    expect(examples).to.be.ok;
  });

  it('should validate a valid base64 string', async function () {
    const b = await Byte.parse(Byte.examples()[0]);
    expect(b).to.be.ok;
    expect(b instanceof Byte).to.be.true;
    expect(b.toString()).to.be.eq(Byte.examples()[0]);
  });

  it('should reject an invalid base64 string', async function () {
    try {
      await Byte.parse('foobarbaz!');
      expect.fail('Should not parse an invalid base64 string');
    } catch (e) {
      expect(e instanceof InvalidInputError).to.be.true;
    }
  });
});
