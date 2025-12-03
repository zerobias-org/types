/* eslint-disable */
import { expect } from 'chai';
import { IpAddress, CoreType } from '../../src/index.js';
import { Type } from '../../generated/model/index.js';

describe('CoreType', function () {
  it('should return a list of all types', async function () {
    const types: Array<string> = CoreType.listTypes();
    const expected = [
      'ipAddress',
      'phoneNumber',
      'uuid',
      'mimeType',
      'url',
      'email',
      'envType',
      'geoCountryInfo',
      'geoCountry',
      'geoPoint',
      'geoSubdivision',
      'cloudAvailabilityZone',
      'cloudProvider',
      'cloudMarket',
      'cloudMarketInfo',
      'cloudRegion',
      'cloudRegionInfo',
      "cidr",
      "cvssVector",
      "semver",
      "language",
      "languageInfo",
      "asymmetricKey",
      "asymmetricKeyInfo",
      "cipherSuite",
      "cipherSuiteInfo",
      "signatureAlgorithm",
      "x509Certificate",
      "x509Subject",
      "tlsProtocol",
      "changeEvent",
      "date",
      "date-time",
      "byte",
      "locale",
      "duration",
      "hostname",
      "netmask",
      "nmtoken",
      "macAddress",
      "integer",
      "int32",
      "int64",
      "double",
      "float",
      "number",
      "password",
      "string",
      "boolean",
      "timeZoneInfo",
      "timeZoneType",
      "timeZone",
      "versionRange",
      "httpMethod",
      "openApiMethod",
      "changeOperation",
      "sortDirection",
      "severity",
      "month",
      "dayOfWeek",
      "cronExpression",
      'oid'
    ].sort();
    expect(types.sort()).to.have.all.members(expected);
  });

  it('All types should be defined', async function () {
    const types: Array<string> = CoreType.listTypes();
    types.forEach(type => {
      const coreType: CoreType = CoreType.get(type);
      expect(coreType).to.be.ok;
      expect(coreType.name).to.be.equals(type);
      expect(coreType.formats).to.be.ok;
      expect(coreType.isEnum).to.be.not.undefined;
      expect(coreType.jsonType).to.be.ok;
      expect(coreType.description).to.be.ok;
      expect(coreType.examples).to.be.ok;
      if (coreType.isEnum) {
        const values = coreType.enumValues;
        // console.log('Values for %s: %s', coreType.name, values);
        expect(values).to.be.ok;
        expect(values.length).to.be.gt(0);
      }
    });
  });

  it('All types should return a new instance', async function () {
    const types: Array<string> = CoreType.listTypes();
    types.forEach(type => {
      const coreType: CoreType = CoreType.get(type);
      const inst = coreType.newInstance(coreType.examples[0]);
      expect(inst).to.be.ok;
      expect((inst as any).toString()).to.be.eq(coreType.examples[0].toString());
    });
  });

  it('All types should validate input via newInstance', async function () {
    const types: Array<string> = CoreType.listTypes();
    types.forEach(type => {
      const coreType: CoreType = CoreType.get(type);
      if (['boolean', 'password', 'string', 'url'].includes(type) || Type.JsonTypeEnum.Object.eq(coreType.jsonType)) {
        return;
      }
      let instance: any;
      try {
        instance = coreType.newInstance('random data');
      } catch (e) {
        return;
      }
      expect.fail(`Failed to fail to validate for ${type}: ${instance}`);
    });
  });

  it('All StringFormat and NumberFormat types should load dynamically', async function () {
    const types: Array<string> = CoreType.listTypes();
    const results: Array<CoreType> = [];
    types.forEach(type => {
      const coreType: CoreType = CoreType.get(type);
      if (coreType.jsonType === Type.JsonTypeEnum.String
        || coreType.jsonType === Type.JsonTypeEnum.Number) {
        results.push(coreType);
      }
    });
    results.forEach(coreType => {
      expect(coreType).to.be.ok;
    });
  });

  it('should return an instance', async function () {
    const ct: CoreType = CoreType.get('ip');
    const ip = ct.newInstance('127.0.0.1');
    expect(ip).to.be.ok;
    expect(ip instanceof IpAddress).to.be.ok;
    expect((ip as IpAddress).isV4()).to.be.ok;
  });

  it('should return the schema for an Object type', async function () {
    const type = CoreType.get('cloudRegionInfo');
    const schema = type.schema;
    expect(type).to.be.ok;
    expect(schema).to.be.ok;
    expect(schema.type).to.be.eq('object');
    expect(schema.properties).to.be.ok;
  });

  it('should return the schema for a referenced enum', async function () {
    const type = CoreType.get('cloudRegionInfo');
    const schema = type.schema;
    expect((schema.properties as any).cloudMarketId.name).to.be.eq('cloudMarket');
  });

  it('should return the schema for an array of referenced objects', async function () {
    const type = CoreType.get('timeZoneInfo');
    const schema = type.schema;
    expect((schema.properties as any).countryCodes.items.name).to.be.eq('geoCountry');
    expect((schema.properties as any).countryCodes.items.schema).to.be.ok;
  });

  it('should return the schema for an Object that references itself', async function () {
    const type = CoreType.get('x509Certificate');
    const schema = type.schema;
    expect(type).to.be.ok;
    expect(schema).to.be.ok;
    expect(schema.type).to.be.eq('object');
    expect(schema.properties).to.be.ok;
    expect((schema.properties as any).issuerCertificate.name).to.be.eq('x509Certificate');
    expect((schema.properties as any).issuerCertificate.schema).to.not.be.empty;
  });

  describe('types-deref#allTypesShouldDeref', function () {
    it('should return the schema for all known types', async function () {
      const libTypes = CoreType.listTypes()
        .map((t) => CoreType.get(t));

      expect(libTypes).to.be.ok;
      expect(libTypes.length).to.be.greaterThan(0);

      libTypes.forEach(type => {
        let schema = type.schema;
        expect(schema).to.be.ok;
        if (Type.JsonTypeEnum.Object.eq(type.jsonType) || type.isEnum) {
          expect(schema).to.be.not.be.empty;
        } else {
          expect(schema).to.be.empty;
        }
      });
    });
  });

  it('should return info objects for a keyed enum type', async function () {
    const type = CoreType.get('geoCountry');
    const infoValues = type.getEnumInfoValues();
    expect(type).to.be.ok;
    expect(infoValues).to.be.ok;
    expect(infoValues.length).to.be.gt(0);
  });

  it('should return descriptions for enums which have them defined', async function () {
    const type = CoreType.get('envType');
    const descriptions = type.enumDescriptions;
    expect(type).to.be.ok;
    expect(descriptions).to.be.ok;
    expect(descriptions.length).to.be.gt(0);
  });

  it('should return an empty array for enums which do not have descriptions defined', async function () {
    const type = CoreType.get('httpMethod');
    const descriptions = type.enumDescriptions;
    expect(type).to.be.ok;
    expect(descriptions).to.be.ok;
    expect(descriptions.length).to.be.eq(0);
  });

  it('should return info objects for all keyed enum types', async function () {
    const type = CoreType.get('geoCountry');
    const infoValues = type.getEnumInfoValues();
    expect(type).to.be.ok;
    expect(infoValues).to.be.ok;
    expect(infoValues.length).to.be.gt(0);

    CoreType.listTypes()
      .map((type) => CoreType.get(type))
      .filter((type) => type.isEnum && type.hasExtendedInfo)
      .forEach((type) => {
        const values = type.getEnumInfoValues();
        expect(values).to.be.ok;
        expect(values.length).to.be.gt(0);
      });
  });

  it('should shadow string', async function () {
    const strType = CoreType.get('string');
    expect(strType).to.be.ok;
    const val = strType.newInstance('foo');
    expect(val).to.be.ok;
    expect(val).to.be.eq('foo');
  });

  it('should shadow boolean', async function () {
    const type = CoreType.get('boolean');
    expect(type).to.be.ok;
    const val = type.newInstance(true);
    expect(val).to.be.ok;
    expect(val).to.be.eq(true);
  });

  it('should verify enum accessors', function () {
    CoreType.listTypes()
      .map((type) => CoreType.get(type))
      .filter((type) => type.isEnum)
      .forEach((type) => {
        const keys = type.enumKeys;
        const values = type.enumValues;
        const members = type.enumMembers;
        const memberKeys = members.map(m => m.key);
        const memberValues = members.map(m => m.value);
        expect(keys.length).to.be.greaterThan(0);
        expect(keys.length).to.eq(values.length);
        expect(keys.length).to.eq(members.length);

        keys.forEach((k) => {
          expect(memberKeys).to.include(k);
        });
        values.forEach((k) => {
          expect(memberValues).to.include(k);
        });

        // Only check a subset, Some enums are too large to just iterate through as such.
        members.slice(0, 50).forEach((m) => {
          const memberByKey = type.getEnumMember(m.key);
          const memberByValue = type.getEnumMember(m.value);
          expect(memberByKey).to.be.ok;
          expect(memberByKey).to.deep.eq(memberByValue);
        });
      });
  });

  it('all the examples should match the patterns', function () {
    const types: Array<string> = CoreType.listTypes();
    types.forEach(type => {
      const coreType: CoreType = CoreType.get(type);
      if (!coreType.pattern) {
        return;
      }
      const pattern = new RegExp(coreType.pattern);
      const examples = coreType.examples;

      examples.forEach(example => {
        expect(pattern.test(example)).true;
      });
    });
  });

  it('all the examples should match the patterns with unicode/strict Regexp enabled', function () {
    const types: Array<string> = CoreType.listTypes();
    types.forEach(type => {
      const coreType: CoreType = CoreType.get(type);
      if (!coreType.pattern) {
        return;
      }
      // https://eslint.org/docs/latest/rules/require-unicode-regexp
      // unicode option also comes with additional pattern validation, which external tools (ajv) were tripping on.
      const pattern = new RegExp(coreType.pattern, 'u');
      const examples = coreType.examples;

      examples.forEach(example => {
        expect(pattern.test(example)).true;
      });
    });
  });

  it('all types should have HTML input types', function () {
    const types: Array<string> = CoreType.listTypes();
    types.forEach(type => {
      const coreType: CoreType = CoreType.get(type);
      expect(coreType.htmlInput).to.be.ok;
    });
  });
});
