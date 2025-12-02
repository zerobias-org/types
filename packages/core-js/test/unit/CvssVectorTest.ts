/* eslint-disable */
import { expect } from 'chai';
import { CvssVector, InvalidInputError, Severity } from '../../src/index.js';

describe('Cvss', function () {
  it('should return a description of the class', async function () {
    const desc = CvssVector.description();
    expect(desc).to.be.ok;
  });

  it('should return examples for the class', async function () {
    const examples = CvssVector.examples();
    expect(examples).to.be.ok;
  });

  it('should return severity based on score', async function () {
    const cvss = await CvssVector.parse(CvssVector.examples()[0]);
    expect(cvss).to.be.ok;
    expect(cvss instanceof CvssVector).to.be.true;
    expect(cvss.severity).to.be.eq(Severity.High);
  });

  it('should return base score', async function () {
    const cvss = await CvssVector.parse(CvssVector.examples()[1]);
    expect(cvss).to.be.ok
    expect(cvss.baseScore).to.be.a("number")
  });

  it('should throw InvalidInputError for a random string', async function () {
    try {
        await CvssVector.parse("random string");
        expect.fail('Should not parse a random string');
    } catch (e) {
        expect(e instanceof InvalidInputError).to.be.true;
    }
  });
  it('should throw InvalidInputError for a bad vector string', async function () {
    try {
        new CvssVector("CVSS:3.1/AV:X/AC:X/PR:X/UI:X/S:X/C:X/I:X/A:X")
        expect.fail('Should not parse a bad vector strin');
    } catch (e) {
        expect(e instanceof InvalidInputError).to.be.true;
    }
  });
});
