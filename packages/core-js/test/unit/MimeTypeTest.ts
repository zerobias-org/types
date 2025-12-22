import { expect } from 'chai';
import { InvalidInputError } from '../../src/index.js';
import { MimeType } from '../../src/types/MimeType.js';
import { allMimeTypes } from './resources/AllMimeTypes.js';
import MIME_TYPES from '@zerobias-org/types-core/data/mimeType/mimeTypes.json' with { type: 'json' };

describe('MimeType', function () {

  it('should return a description of the class', async function () {
    const desc = MimeType.description().toUpperCase();
    expect(desc).to.be.ok;
    expect(desc).to.include('MIME');
  });

  it('should return examples for the class', async function () {
    const examples = MimeType.examples();
    expect(examples).to.be.ok;
  });

  it('should validate a valid MIME Type', async function () {
    const mimeType = await MimeType.parse('application/json');
    expect(mimeType).to.be.ok;
    expect(mimeType instanceof MimeType).to.be.true;
  });

  it('should reject a random string', async function () {
    try {
      await MimeType.parse(Math.random().toString(36));
      expect.fail('Should not parse a random string');
    } catch (e) {
      expect(e instanceof InvalidInputError).to.be.true;
    }
  });

  it('should retrieve the name of the MIME Type', async function () {
    const mimeType = new MimeType('application/pdf');
    const name = await mimeType.getName();
    expect(name).to.be.equal('pdf');
    const isUnknown = mimeType.isUnknown();
    expect(isUnknown).to.be.false;
  });

  it('should validate unknown MIME Type', async function () {
    const mimeType = new MimeType('application/x-foo.bar+json');
    expect(mimeType).to.be.ok;
    const name = mimeType.getName();
    expect(name).to.be.equal(undefined);
    const isUnknown = mimeType.isUnknown();
    expect(isUnknown).to.be.true;
    const mime = mimeType.toString();
    expect(mime).to.be.equal('application/x-foo.bar+json');
  });

  it('should validate all types in data', async function () {
    const types = MIME_TYPES.map(m => m.template);
    for (const type of types) {
      const mimeType = new MimeType(type);
      expect(mimeType).to.be.ok;
    }
  });

  it('should reject a string that doesn\'t match MIME Type pattern', async function () {
    try {
      new MimeType('x.application/json');
      expect.fail('Should have not parsed the string');
    } catch (e) {
      expect(e instanceof InvalidInputError).to.be.true;
    }
  });

  it('should validate all types in allMimeTypes', async function () {
    for (const type of allMimeTypes) {
      const mimeType = new MimeType(type);
      expect(mimeType).to.be.ok;
      const hasName = !!(mimeType.getName());
      const isUnknown = mimeType.isUnknown();
      expect(hasName).to.be.equal(!isUnknown);
    }
  });
});
