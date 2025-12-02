/* eslint-disable */
import { expect } from "chai";
import { CoreType, InvalidInputError, Type } from "../../src/index.js";
import { Integer } from "../../src/types/Integer.js";

describe('Integer', function () {

  it('should return a description of the class', function () {
    const desc = Integer.description();
    expect(desc).to.be.ok;
    expect(desc).to.include('integer');
  });

  it('should return examples for the class', function () {
    const examples = Integer.examples();
    expect(examples).to.be.ok;
  });

  it('should validate a positive integer', async function () {
    const int = await Integer.parse(79238723);
    expect(int).to.be.ok;
    expect(int instanceof Integer).to.be.true;
    expect(int.toNumber()).to.equal(79238723);
  });

  it('should validate a negative integer', async function () {
    const int = await Integer.parse(-23903232);
    expect(int).to.be.ok;
    expect(int instanceof Integer).to.be.true;
    expect(int.toNumber()).to.equal(-23903232);
  });

  it('should validate a number greater than 2^53 + 1, but with a precision loss', async function() {
    const int = await Integer.parse(392832983290302983032);
    expect(int).to.be.ok;
    expect(int instanceof Integer).to.be.true;
    expect("392832983290302983032").to.not.equal(int.toString());
  })

  it('should jsonify correctly', async function() {
    const int = await Integer.parse(1233171303100790);
    expect(int).to.be.ok;
    expect(int.toJSON()).to.equal(int.toNumber());
  });

  it('should reject a positive floating-point number', async function () {
    try {
      await Integer.parse(12337073097032.12);
      expect.fail('Should not parse a floating-point number');
    } catch (e) {
      expect(e instanceof InvalidInputError).to.be.true;
    }
  });

  it('should reject a negative floating-point number', async function () {
    try {
      await Integer.parse(-97307370923.1232);
      expect.fail('Should not parse a floating-point number');
    } catch (e) {
      expect(e instanceof InvalidInputError).to.be.true;
    }
  });
 
  it('should have the proper HTML input type', async function () {
    const ct = CoreType.get('integer');
    expect(ct.htmlInput).to.be.eq(Type.HtmlInputEnum.Number);
  });
});
