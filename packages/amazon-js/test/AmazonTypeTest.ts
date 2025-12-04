import { CoreType, Type } from "@zerobias-org/types-core-js";
import { expect } from "chai";

const isOwnType = (type: CoreType): boolean => {
  return type['library'].libraryName === '@zerobias-org/types-amazon';
};

describe('types', function () {
  it('Should include types', async function () {
    const types = CoreType.listTypes();
    expect(types).to.include('awsAccessPolicy');
    expect(types).to.include('awsAccessPolicyStatement');
    expect(types).to.include('awsAccessPolicyStatementCondition');
    expect(types).to.include('awsAccessPolicyStatementResource');
    expect(types).to.include('awsAccessPolicyStatementOperator');
    expect(types).to.include('awsAccessPolicyStatementEffect');
    expect(types).to.include('awsPartition');
    expect(types).to.include('awsCloudRegion');
    expect(types).to.include('awsService');
  });

  describe('types#accessPolicy', function () {
    it('Should load type', async function () {
      const ct = CoreType.get('awsAccessPolicy');
      expect(ct.isEnum).to.be.false;
      expect(Type.JsonTypeEnum.Object.eq(ct.jsonType)).to.ok;
    });
  });

  describe('types#accessPolicyStatement', function () {
    it('Should load type', async function () {
      const ct = CoreType.get('awsAccessPolicyStatement');
      expect(ct.isEnum).to.be.false;
      expect(Type.JsonTypeEnum.Object.eq(ct.jsonType)).to.ok;
    });
  });

  describe('types#accessPolicyStatementCondition', function () {
    it('Should load type', async function () {
      const ct = CoreType.get('awsAccessPolicyStatementCondition');
      expect(ct.isEnum).to.be.false;
      expect(Type.JsonTypeEnum.Object.eq(ct.jsonType)).to.ok;
    });
  });

  describe('types-deref#accessPolicy', function () {
    it('should return the schema for an array of referenced objects', async function () {
      const type = CoreType.get('awsAccessPolicy');
      const schema = type.schema;
      expect((schema.properties as any).id).to.be.ok;
      expect((schema.properties as any).version).to.be.ok;
      expect((schema.properties as any).statements.items.name).to.be.eq('awsAccessPolicyStatement');
      expect((schema.properties as any).statements.items.schema).to.be.ok;
      expect((schema.properties as any).statements.items.schema.properties.conditions.items.name).to.be.eq('awsAccessPolicyStatementCondition');
      expect((schema.properties as any).statements.items.schema.properties.conditions.items.schema).to.be.ok;
    });
  });

  describe('types-deref#accessPolicyStatement', function () {
    it('should return the schema for an array of referenced objects', async function () {
      const type = CoreType.get('awsAccessPolicyStatement');
      const schema = type.schema;
      expect((schema.properties as any).conditions.items.name).to.be.eq('awsAccessPolicyStatementCondition');
      expect((schema.properties as any).conditions.items.schema).to.be.ok;

      expect((schema.properties as any).resources.items).to.be.ok;
      expect((schema.properties as any).resources.items.anyOf).to.be.ok;
      expect((schema.properties as any).resources.items.anyOf[0].type).to.eq('string');
      expect((schema.properties as any).resources.items.anyOf[0].format).to.eq('arn');
      expect((schema.properties as any).resources.items.anyOf[1].schema.type).to.eq('string');
      expect((schema.properties as any).resources.items.anyOf[1].schema.enum).to.include('all');
    });
  });

  describe('types-deref#allTypesShouldDeref', function () {
    it('should return the schema for all of this library\'s types', async function () {
      const libTypes = CoreType.listTypes()
        .map((t) => CoreType.get(t))
        .filter(t => isOwnType(t));

      expect(libTypes).to.be.ok;
      expect(libTypes.length).to.be.greaterThan(0);

      for (const type of libTypes) {
        let schema = type.schema;
        expect(schema).to.be.ok;
        if (Type.JsonTypeEnum.Object.eq(type.jsonType) || type.isEnum) {
          expect(schema).to.be.not.be.empty;
        } else {
          expect(schema).to.be.empty;
        }
      }
    });
  });

  describe('types-allEnumsShouldHaveKeysAndValues', function () {
    it('should verify keys and values of enum types', async function () {
      const libTypes = CoreType.listTypes()
        .map((t) => CoreType.get(t))
        .filter(t => isOwnType(t))
        .filter((type) => type.isEnum);

      expect(libTypes.length).to.be.greaterThan(0);
      for (const type of libTypes) {
        const keys = type.enumKeys;
        const values = type.enumValues;
        expect(keys.length).to.be.greaterThan(0);
        expect(keys.length).to.eq(values.length);
      }
    });
  });

  it('should verify enum accessors', function () {
    for (const type of CoreType.listTypes()
      .map((t) => CoreType.get(t))
      .filter(t => isOwnType(t))
      .filter((type) => type.isEnum)) {
        const keys = type.enumKeys;
        const values = type.enumValues;
        const members = type.enumMembers;
        const memberKeys = members.map(m => m.key);
        const memberValues = members.map(m => m.value);
        expect(keys.length).to.be.greaterThan(0);
        expect(keys.length).to.eq(values.length);
        expect(keys.length).to.eq(members.length);

        for (const k of keys) {
          expect(memberKeys).to.include(k);
        }

        for (const k of values) {
          expect(memberValues).to.include(k);
        }

        for (const m of members.slice(0, 50)) {
          const memberByKey = type.getEnumMember(m.key);
          const memberByValue = type.getEnumMember(m.value);
          expect(memberByKey).to.be.ok;
          expect(memberByKey).to.deep.eq(memberByValue);
        }
      }
  });
});
