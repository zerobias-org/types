import { createRequire } from 'node:module';
import { expect } from 'chai';

import { CoreType } from '../../src/index.js';
const require = createRequire(import.meta.url);
const dataObject = require('@zerobias-org/types-core/data/tls/cipherSuites.json');

describe('CypherSuite', () => {
  it('should return enum values', () => {
    expect(dataObject).instanceOf(Array);

    const cyphers = CoreType.get('cipherSuite').enumValues;
    expect(dataObject).to.have.length(cyphers.length);
    cyphers.forEach((code, i) => {
      expect(code).eq(dataObject[i].description);
    });
  });
  
  it('should return enum keys', () => {
    expect(dataObject).instanceOf(Array);

    const cyphers = CoreType.get('cipherSuite').enumKeys;
    expect(dataObject).to.have.length(cyphers.length);
    cyphers.forEach((code, i) => {
      expect(code).not.eq(dataObject[i].description);
    });
  });
});
