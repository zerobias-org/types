/* eslint-disable */
import { expect } from 'chai';
import { EnumValue } from '../../src/index.js';

const testValue = EnumValue.instance('Test', 'ApiKey', 'API_KEY', 'An API key');

describe('EnumValue', function () {
  it('should return the value for toString', async function () {
    expect(testValue.toString()).to.be.eq(testValue.value);
  });

  it('should return the value for toPostgres', async function () {
    expect(testValue.toPostgres()).to.be.eq(testValue.value);
  });

  it('should return a useful debugging string', async function () {
    const debug = testValue.toDebugString();
    expect(debug).to.contain(testValue.key);
    expect(debug).to.contain(testValue.value);
    expect(debug).to.contain(testValue.description);
  });

  it('should support numeric enums', async function () {
    const numeric = EnumValue.instance('Test', 0, 'Zero', 'A Zero - is it positive, or is it negative?');
    expect(numeric).to.be.ok;
    expect(numeric.key).to.be.a('number');
    expect(numeric.key).to.be.eq(0);
  });

  it('should support values without descriptions', async function () {
    const noDesc = EnumValue.instance('Test', 'test', 'Test');
    expect(noDesc).to.be.ok;
    expect(noDesc.description).to.be.undefined;
  });
});
