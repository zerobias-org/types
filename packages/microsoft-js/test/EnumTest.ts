import { CoreType } from "@zerobias-org/types-core-js";
import { expect } from "chai";

describe('enums', function () {
  it('Should include enums', async function () {
    const types = CoreType.listTypes();
    expect(types).to.include('azureResourceProvider');
    expect(types).to.include('azureCloudRegion');
    expect(types).to.include('azureVmSize');
    expect(types).to.include('azureResourceSkuTier');
    expect(types).to.include('azureResourceIdentityType');
  });
});

describe('enums#azureVmSize', function () {
  it('Should load enum values', async function () {
    const ct = CoreType.get('azureVmSize');
    expect(ct.enumValues).to.be.ok;
    expect(ct.getEnumInfoValues()).to.be.ok;
    expect(ct.getEnumInfoValues().length).eq(0);

    const expected = {
      key: 'StandardD1V2',
      value: 'standard_d1_v2',
      description: undefined
    };
    expect(ct.getEnumMember('standard_d1_v2')).to.deep.eq(expected);
    expect(ct.getEnumMember('StandardD1V2')).to.deep.eq(expected);
  });
});

describe('enums#azureResourceProvider', function () {
  it('Should load enum values', async function () {
    const ct = CoreType.get('azureResourceProvider');
    expect(ct.enumValues).to.be.ok;
    expect(ct.getEnumInfoValues()).to.be.ok;
    expect(ct.getEnumInfoValues().length).eq(0);

    const expected = {
      key: 'AutonomousSystems',
      value: 'autonomous_systems',
      description: undefined
    };
    expect(ct.getEnumMember('autonomous_systems')).to.deep.eq(expected);
    expect(ct.getEnumMember('AutonomousSystems')).to.deep.eq(expected);
  });
});

describe('enums#azureCloudRegion', function () {
  it('Should load enum values', async function () {
    const ct = CoreType.get('azureCloudRegion');
    expect(ct.enumValues).to.be.ok;
    expect(ct.getEnumInfoValues()).to.be.ok;
    expect(ct.getEnumInfoValues().length).eq(0);

    const expected = {
      key: 'Westcentralus',
      value: 'westcentralus',
      description: "West Central US"
    };
    expect(ct.getEnumMember('westcentralus')).to.deep.eq(expected);
    expect(ct.getEnumMember('Westcentralus')).to.deep.eq(expected);
  });
});

describe('enums#azureResourceSkuTier', function () {
  it('Should load enum values', async function () {
    const ct = CoreType.get('azureResourceSkuTier');
    expect(ct.enumValues).to.be.ok;
    expect(ct.getEnumInfoValues()).to.be.ok;
    expect(ct.getEnumInfoValues().length).eq(0);

    const expected = {
      key: 'HighDensity',
      value: 'high_density',
      description: undefined
    };
    expect(ct.getEnumMember('high_density')).to.deep.eq(expected);
    expect(ct.getEnumMember('HighDensity')).to.deep.eq(expected);
  });
});

describe('enums#azureResourceIdentityType', function () {
  it('Should load enum values', async function () {
    const ct = CoreType.get('azureResourceIdentityType');
    expect(ct.enumValues).to.be.ok;
    expect(ct.getEnumInfoValues()).to.be.ok;
    expect(ct.getEnumInfoValues().length).eq(0);
    const expected = {
      key: 'SystemAssigned',
      value: 'system_assigned',
      description: undefined
    };
    expect(ct.getEnumMember('system_assigned')).to.deep.eq(expected);
    expect(ct.getEnumMember('SystemAssigned')).to.deep.eq(expected);
  });
});
