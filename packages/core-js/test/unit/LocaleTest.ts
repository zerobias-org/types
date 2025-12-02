import { expect } from 'chai';
import { CoreType } from '../../src/index.js';

describe('Locale', () => {
  it('should return enum values', () => {
    const locales = CoreType.get('locale').enumValues;
    expect(locales).to.have.length(429);
    expect(locales[0]).to.eq('af_NA');
  });

  it('should return enum keys', () => {
    const locales = CoreType.get('locale').enumKeys;
    expect(locales).to.have.length(429);
    expect(locales[0]).to.eq('AfNa');
  });

  it('Should load a member', async function () {
    const ct = CoreType.get('locale');
    
    const expected = {
      key: 'AfNa',
      value: 'af_NA',
      description: 'Afrikaans (Namibia)'
    };

    expect(ct.getEnumMember('af_NA')).to.deep.eq(expected);
    expect(ct.getEnumMember('AfNa')).to.deep.eq(expected);
  });
});
