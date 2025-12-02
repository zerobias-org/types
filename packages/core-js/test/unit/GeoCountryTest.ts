import { createRequire } from 'node:module';
import { expect } from 'chai';

import { CoreType } from '../../src/index.js';
const require = createRequire(import.meta.url);
const dataObject = require('@zerobias-org/types-core/data/geo/geoCountries.json');

describe('GeoCountry', () => {

  it('should return enum values', () => {
    expect(dataObject).instanceOf(Array);

    const countryCodes = CoreType.get('geoCountry').enumValues;
    expect(dataObject).to.have.length(countryCodes.length);
    expect(countryCodes[0]).to.eq('AD');
    countryCodes.forEach((code, i) => {
      expect(code).eq(dataObject[i].alpha2);
    });
  });

  it('should return enum keys', () => {
    expect(dataObject).instanceOf(Array);

    const countryCodes = CoreType.get('geoCountry').enumKeys;
    expect(dataObject).to.have.length(countryCodes.length);
    expect(countryCodes[0]).to.eq('Ad');
    countryCodes.forEach((code, i) => {
      expect(code).not.eq(dataObject[i].alpha2);
    });
  });

  it('Should load a member', async function () {
    const ct = CoreType.get('geoCountry');
    
    const expected = {
      key: 'Gb',
      value: 'GB',
      description: 'United Kingdom of Great Britain and Northern Ireland'
    };

    expect(ct.getEnumMember('GB')).to.deep.eq(expected);
    expect(ct.getEnumMember('Gb')).to.deep.eq(expected);
  });
});
