import { CoreType, Type } from "@zerobias-org/types-core-js";
import { expect } from "chai";

const isOwnType = (type: CoreType): boolean => {
  return type['library'].libraryName === '@zerobias-org/types-google';
};

describe('types', function () {
  it('Should include types', async function () {
    const types = CoreType.listTypes();
    expect(types).to.include('gcpAccessPolicy');
    expect(types).to.include('gcpAccessPolicyAuditConfig');
    expect(types).to.include('gcpAccessPolicyAuditLogConfig');
    expect(types).to.include('gcpAccessPolicyBinding');
    expect(types).to.include('gcpAccessPolicyBindingCondition');
  });

  describe('types#accessPolicy', function () {
    it('Should load type', async function () {
      const ct = CoreType.get('gcpAccessPolicy');
      expect(ct.isEnum).to.be.false;
      expect(Type.JsonTypeEnum.Object.eq(ct.jsonType)).to.ok;
    });
  });

  describe('types#gcpAccessPolicyAuditConfig', function () {
    it('Should load type', async function () {
      const ct = CoreType.get('gcpAccessPolicyAuditConfig');
      expect(ct.isEnum).to.be.false;
      expect(Type.JsonTypeEnum.Object.eq(ct.jsonType)).to.ok;
    });
  });

  describe('types#gcpAccessPolicyAuditLogConfig', function () {
    it('Should load type', async function () {
      const ct = CoreType.get('gcpAccessPolicyAuditLogConfig');
      expect(ct.isEnum).to.be.false;
      expect(Type.JsonTypeEnum.Object.eq(ct.jsonType)).to.ok;
    });
  });

  describe('types#gcpAccessPolicyBinding', function () {
    it('Should load type', async function () {
      const ct = CoreType.get('gcpAccessPolicyBinding');
      expect(ct.isEnum).to.be.false;
      expect(Type.JsonTypeEnum.Object.eq(ct.jsonType)).to.ok;
    });
  });

  describe('types#gcpAccessPolicyBindingCondition', function () {
    it('Should load type', async function () {
      const ct = CoreType.get('gcpAccessPolicyBindingCondition');
      expect(ct.isEnum).to.be.false;
      expect(Type.JsonTypeEnum.Object.eq(ct.jsonType)).to.ok;
    });
  });

  describe('types-deref#accessPolicy', function () {
    it('should return the schema for an access policy', async function () {
      const type = CoreType.get('gcpAccessPolicy');
      const schema = type.schema;
      console.log(JSON.stringify(schema, null, 2));
      expect((schema.properties as any).version.name).to.be.eq('gcpAccessPolicyVersion');
      expect((schema.properties as any).version.schema).to.be.ok;
      expect((schema.properties as any).auditConfigs.items.name).to.be.eq('gcpAccessPolicyAuditConfig');
      expect((schema.properties as any).auditConfigs.items.schema).to.be.ok;
      expect((schema.properties as any).bindings.items.name).to.be.eq('gcpAccessPolicyBinding');
      expect((schema.properties as any).bindings.items.schema).to.be.ok;
      expect((schema.properties as any).etag).to.be.ok;
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
