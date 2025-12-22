import { expect } from 'chai';

import { CoreType } from '../../src/index.js';
import dataObject from '@zerobias-org/types-core/data/geo/geoCountries.json' with { type: 'json' };

describe('GeoCountry', () => {

  it('should return enum values', () => {
    expect(dataObject).instanceOf(Array);

    const countryCodes = CoreType.get('geoCountry').enumValues;
    expect(dataObject).to.have.length(countryCodes.length);
    expect(countryCodes[0]).to.eq('AD');
    for (const [i, code] of countryCodes.entries()) {
      expect(code).eq(dataObject[i].alpha2);
    }
  });

  it('should return enum keys', () => {
    expect(dataObject).instanceOf(Array);

    const countryCodes = CoreType.get('geoCountry').enumKeys;
    expect(dataObject).to.have.length(countryCodes.length);
    expect(countryCodes[0]).to.eq('Ad');
    for (const [i, code] of countryCodes.entries()) {
      expect(code).not.eq(dataObject[i].alpha2);
    }
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
