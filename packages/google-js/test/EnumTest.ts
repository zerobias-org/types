import { CoreType } from "@zerobias-org/types-core-js";
import { expect } from "chai";
import { GcpAccessPolicyVersion } from "../src/index.js";
import { GoogleType } from "../src/GoogleType.js";

before('setup', function () {
  // Needs import/static init
  GoogleType.get(`gcpAccessPolicy`);
}); 

describe('enums', function () {
  it('Should include enums', async function () {
    const types = CoreType.listTypes();
    expect(types).to.include('gcpAccessPolicyAuditLogConfigType');
    expect(types).to.include('gcpAccessPolicyVersion');
  });
});

describe('enums#accessPolicyAuditLogConfigType', function () {
  it('Should load enum values', async function () {
    const ct = CoreType.get('gcpAccessPolicyAuditLogConfigType');
    expect(ct.enumValues).to.be.ok;
    expect(ct.getEnumInfoValues()).to.be.ok;
    expect(ct.getEnumInfoValues().length).eq(0);

    const expected = {
      key: 'AdminRead',
      value: 'admin_read',
      description: undefined
    };
    expect(ct.getEnumMember('admin_read')).to.deep.eq(expected);
    expect(ct.getEnumMember('AdminRead')).to.deep.eq(expected);
  });
});

describe('enums#gcpAccessPolicyVersion', function () {
  it('Should load enum values', async function () {
    const ct = CoreType.get('gcpAccessPolicyVersion');
    expect(ct.enumValues).to.be.ok;
    expect(ct.enumValues.length).to.eq(3);
    expect(ct.enumValues).to.have.all.members([0, 1, 3]);

    const expected = {
      key: 'NUMBER_1',
      value: 1,
      description: undefined
    };
    expect(ct.getEnumMember('1')).to.deep.eq(expected);
    expect(ct.getEnumMember('NUMBER_1')).to.deep.eq(expected);
  });
});

describe('enums#gcpAccessPolicyVersion', function () {
  it('Should load enum keys', async function () {
    const ct = CoreType.get('gcpAccessPolicyVersion');
    expect(ct.enumKeys).to.be.ok;
    expect(ct.enumKeys.length).to.eq(3);
    expect(ct.enumKeys).to.have.all.members(['NUMBER_0', 'NUMBER_1', 'NUMBER_3']);
  });
});
