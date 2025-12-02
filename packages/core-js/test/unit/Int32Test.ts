/* eslint-disable */
import { expect } from "chai";
import { CoreType, InvalidInputError, Type } from "../../src/index.js";
import { Int32 } from "../../src/types/Int32.js";

describe('Int32', function () {

  it('should return a description of the class', function () {
    const desc = Int32.description();
    expect(desc).to.be.ok;
    expect(desc).to.include('32');
  });

  it('should return examples for the class', function () {
    const examples = Int32.examples();
    expect(examples).to.be.ok;
  });

  it('should validate a 32-bit positive int', async function () {
    const int32 = await Int32.parse(1233);
    expect(int32).to.be.ok;
    expect(int32 instanceof Int32).to.be.true;
    expect(int32.toNumber()).to.equal(1233);
  });

  it('should validate a 32-bit negative int', async function () {
    const int32 = await Int32.parse(-1121233);
    expect(int32).to.be.ok;
    expect(int32 instanceof Int32).to.be.true;
    expect(int32.toNumber()).to.equal(-1121233);
  });

  it('should jsonify correctly', async function() {
    const int32 = await Int32.parse(2022);
    expect(int32).to.be.ok;
    expect(int32.toJSON()).to.equal(int32.toNumber());
  });

  it('should reject a greater than 32-bit signed int max value', async function () {
    try {
      await Int32.parse(1233707309702332);
      expect.fail('Should not parse an integer larger than 32-bit');
    } catch (e) {
      expect(e instanceof InvalidInputError).to.be.true;
    }
  });

  it('should reject a smaller than 32-bit signed int min value', async function () {
    try {
      await Int32.parse(-973370737092332);
      expect.fail('Should not parse an integer larger than 32-bit');
    } catch (e) {
      expect(e instanceof InvalidInputError).to.be.true;
    }
  });

  it('should have the proper HTML input type', async function () {
    const ct = CoreType.get('integer');
    expect(ct.htmlInput).to.be.eq(Type.HtmlInputEnum.Number);
  });
});
