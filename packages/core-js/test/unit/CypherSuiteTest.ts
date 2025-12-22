import { expect } from 'chai';

import { CoreType } from '../../src/index.js';
import dataObject from '@zerobias-org/types-core/data/tls/cipherSuites.json' with { type: 'json' };

describe('CypherSuite', () => {
  it('should return enum values', () => {
    expect(dataObject).instanceOf(Array);

    const cyphers = CoreType.get('cipherSuite').enumValues;
    expect(dataObject).to.have.length(cyphers.length);
    for (const [i, code] of cyphers.entries()) {
      expect(code).eq(dataObject[i].description);
    }
  });
  
  it('should return enum keys', () => {
    expect(dataObject).instanceOf(Array);

    const cyphers = CoreType.get('cipherSuite').enumKeys;
    expect(dataObject).to.have.length(cyphers.length);
    for (const [i, code] of cyphers.entries()) {
      expect(code).not.eq(dataObject[i].description);
    }
  });
});
