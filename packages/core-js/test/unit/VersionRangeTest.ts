/* eslint-disable */
import { expect } from 'chai';
import { Semver } from '../../src/types/Semver.js';
import { VersionRange } from '../../src/types/VersionRange.js';

describe('VersionRange', function () {
  it('should return a description of the class', async function () {
    const desc = VersionRange.description();
    expect(desc).to.be.ok;
    expect(desc).to.include('semver version ranges');
  });

  it('should return examples for the class', async function () {
    const examples = VersionRange.examples();
    expect(examples).to.be.ok;
  });

  it('should validate all examples', async function () {
    VersionRange.examples().forEach(async (range) => {
      const response = await VersionRange.parse(range);
      expect(response).to.be.ok;
    })
  });

  it('should validate a version matching the range', async function () {
    const range = new VersionRange('1.0.x');
    const ver = new Semver('1.0.5');
    expect(range.includes(ver)).to.be.true;
  })

  it('should not validate a version not matching the range', async function () {
    const range = new VersionRange('1.0.x');
    const ver = new Semver('2.0.5');
    expect(range.includes(ver)).to.be.false;
  })
});
