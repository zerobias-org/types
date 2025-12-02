/* eslint-disable */
import { expect } from "chai";
import { CoreType, InvalidInputError, Type } from "../../src/index.js";
import { Int64 } from "../../src/types/Int64.js";

describe('Int64', function () {

  it('should return a description of the class', function () {
    const desc = Int64.description();
    expect(desc).to.be.ok;
    expect(desc).to.include('64');
  });

  it('should return examples for the class', function () {
    const examples = Int64.examples();
    expect(examples).to.be.ok;
  });

  it('should validate a 64-bit positive int smaller than 2^53 - 1', async function () {
    const int64 = await Int64.parse(1233171303100790);
    expect(int64).to.be.ok;
    expect(int64 instanceof Int64).to.be.true;
    expect(int64.toNumber()).to.equal(1233171303100790);
  });

  it('should validate a 64-bit negative int greater than -2^53', async function () {
    const int64 = await Int64.parse(-11212786688833);
    expect(int64).to.be.ok;
    expect(int64 instanceof Int64).to.be.true;
    expect(int64.toNumber()).to.equal(-11212786688833);
  });

  it('should jsonify correctly', async function() {
    const int64 = await Int64.parse(1233171303100790);
    expect(int64).to.be.ok;
    expect(int64.toJSON()).to.equal(int64.toNumber());
  });

  it('should reject a positive floating-point number smaller than 2^53 - 1', async function () {
    try {
      await Int64.parse(12337073097032.12);
      expect.fail('Should not parse a floating-point number');
    } catch (e) {
      expect(e instanceof InvalidInputError).to.be.true;
    }
  });

  it('should reject a negative floating-point number greater than -2^53', async function () {
    try {
      await Int64.parse(-9730737092332.9123);
      expect.fail('Should not parse a floating-point number');
    } catch (e) {
      expect(e instanceof InvalidInputError).to.be.true;
    }
  });

  it('should reject a number greater than 2^53 - 1', async function () {    
    try {                       
      await Int64.parse(9007199254740992);
      expect.fail('Should not parse a number greater than 2^53 - 1');
    } catch(e) {
      expect(e instanceof InvalidInputError).to.be.true;
    }
  });

  it('should reject a number smaller than -2^53 + 1', async function () {    
    try {                       
      await Int64.parse(-9007199254740999);
      expect.fail('Should not parse a number smaller than -2^53 + 1');
    } catch(e) {
      expect(e instanceof InvalidInputError).to.be.true;
    }
  });
 
  it('should have the proper HTML input type', async function () {
    const ct = CoreType.get('integer');
    expect(ct.htmlInput).to.be.eq(Type.HtmlInputEnum.Number);
  });
});
