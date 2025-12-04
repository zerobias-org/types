import { createRequire } from 'node:module';
import { expect } from 'chai';

import { CoreType } from '../../src/index.js';
const require = createRequire(import.meta.url);
const dataObject = require('@zerobias-org/types-core/data/language/languages.json');

describe('Language', () => {

  it('should return enum values', () => {
    expect(dataObject).instanceOf(Array);

    const languageCodes = CoreType.get('language').enumValues;
    expect(dataObject).to.have.length(languageCodes.length);
    expect(languageCodes[0]).to.eq('aa');
    for (const [i, code] of languageCodes.entries()) {
      expect(code).eq(dataObject[i].alpha2);
    }
  });

  it('should return enum keys', () => {
    expect(dataObject).instanceOf(Array);

    const languageCodes = CoreType.get('language').enumKeys;
    expect(dataObject).to.have.length(languageCodes.length);
    expect(languageCodes[0]).to.eq('Aa');
    for (const [i, code] of languageCodes.entries()) {
      expect(code).not.eq(dataObject[i].alpha2);
    }
  });

  it('Should load a member', async function () {
    const ct = CoreType.get('language');
    
    const expected = {
      key: 'En',
      value: 'en',
      description: 'English'
    };

    expect(ct.getEnumMember('en')).to.deep.eq(expected);
    expect(ct.getEnumMember('En')).to.deep.eq(expected);
  });
});
