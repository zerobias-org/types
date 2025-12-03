import { CoreType, Type } from "@zerobias-org/types-core-js";
import { expect } from "chai";

const isOwnType = (type: CoreType): boolean => {
  return type['library'].libraryName === '@zerobias-org/types-microsoft';
};

describe('types', function () {
  it('Should include types', async function () {
    const types = CoreType.listTypes();
    expect(types).to.include('azureResource');
    expect(types).to.include('azureResourceInfo');
    expect(types).to.include('azureResourceIdentity');
    expect(types).to.include('azureResourcePlan');
    expect(types).to.include('azureResourceSku');
  });

  describe('types#azureResource', function () {
    it('Should load type', async function () {
      const ct = CoreType.get('azureResource');
      expect(ct.isEnum).to.be.false;
      expect(Type.JsonTypeEnum.Object.eq(ct.jsonType)).to.ok;
    });
  });

  describe('types#azureResourceInfo', function () {
    it('Should load type', async function () {
      const ct = CoreType.get('azureResourceInfo');
      expect(ct.isEnum).to.be.false;
      expect(Type.JsonTypeEnum.Object.eq(ct.jsonType)).to.ok;

      const schema = ct.schema;
      expect(schema).to.be.ok;
      expect(schema).to.be.not.be.empty;
    });
  });

  describe('types#azureResourceIdentity', function () {
    it('Should load type', async function () {
      const ct = CoreType.get('azureResourceIdentity');
      expect(ct.isEnum).to.be.false;
      expect(Type.JsonTypeEnum.Object.eq(ct.jsonType)).to.ok;
    });
  });

  describe('types#azureResourcePlan', function () {
    it('Should load type', async function () {
      const ct = CoreType.get('azureResourcePlan');
      expect(ct.isEnum).to.be.false;
      expect(Type.JsonTypeEnum.Object.eq(ct.jsonType)).to.ok;
    });
  });

  describe('types#azureResourceSku', function () {
    it('Should load type', async function () {
      const ct = CoreType.get('azureResourceSku');
      expect(ct.isEnum).to.be.false;
      expect(Type.JsonTypeEnum.Object.eq(ct.jsonType)).to.ok;
    });
  });

  describe('types#azureResourceInfo', function () {
    it('Should deref allOf and anyOf', async function () {
      const ct = CoreType.get('azureResourceInfo');
      expect(ct.isEnum).to.be.false;
      expect(Type.JsonTypeEnum.Object.eq(ct.jsonType)).to.ok;

      const schema = ct.schema;
      expect(schema).to.be.ok;
      expect(schema).to.be.ok;
      expect(schema.type).to.be.eq('object');
      expect(schema.properties).to.be.ok;
      // AzureResource properties
      expect((schema.properties as any).id).to.be.ok;
      expect((schema.properties as any).name).to.be.ok;
      expect((schema.properties as any).type).to.be.ok;
      // extended properties
      expect((schema.properties as any).location).to.be.ok;
      expect((schema.properties as any).location.anyOf).to.be.ok;
      expect((schema.properties as any).location.anyOf.length).to.eq(2);
      expect((schema.properties as any).location.anyOf[0].name).to.eq('azureRegion');
      expect((schema.properties as any).location.anyOf[0].schema).to.be.ok;
      expect((schema.properties as any).location.anyOf[0].schema.type).to.eq('string');
      expect((schema.properties as any).location.anyOf[0].schema.enum).to.be.ok;
      expect((schema.properties as any).location.anyOf[1].name).to.eq('azureAdditionalLocations');
      expect((schema.properties as any).location.anyOf[1].schema).to.be.ok;
      expect((schema.properties as any).location.anyOf[1].schema.type).to.eq('string');
      expect((schema.properties as any).location.anyOf[1].schema.enum).to.be.ok;
      expect((schema.properties as any).identity).to.be.ok;
      expect((schema.properties as any).plan).to.be.ok;
      expect((schema.properties as any).plan.name).to.eq('azureResourcePlan');
      expect((schema.properties as any).plan.schema).to.be.ok;
      expect((schema.properties as any).sku).to.be.ok;
      expect((schema.properties as any).sku.name).to.eq('azureResourceSku');
      expect((schema.properties as any).sku.schema).to.be.ok;

    });
  });

  describe('types-deref#allTypesShouldDeref', function () {
    it('should return the schema for all of this library\'s types', async function () {
      const libTypes = CoreType.listTypes()
        .map((t) => CoreType.get(t))
        .filter(t => isOwnType(t));

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

  describe('types-allEnumsShouldHaveKeysAndValues', function () {
    it('should verify keys and values of enum types', async function () {
      const libTypes = CoreType.listTypes()
        .map((t) => CoreType.get(t))
        .filter(t => isOwnType(t))
        .filter((type) => type.isEnum);

      expect(libTypes.length).to.be.greaterThan(0);
      libTypes.forEach((type) => {
        const keys = type.enumKeys;
        const values = type.enumValues;
        expect(keys.length).to.be.greaterThan(0);
        expect(keys.length).to.eq(values.length);
      });
    });
  });

  it('should verify enum accessors', function () {
    CoreType.listTypes()
      .map((t) => CoreType.get(t))
      .filter(t => isOwnType(t))
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

        members.slice(0, 50).forEach((m) => {
          const memberByKey = type.getEnumMember(m.key);
          const memberByValue = type.getEnumMember(m.value);
          expect(memberByKey).to.be.ok;
          expect(memberByKey).to.deep.eq(memberByValue);
        });
      });
  });
});
