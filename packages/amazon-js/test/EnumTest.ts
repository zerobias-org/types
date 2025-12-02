import { CoreType } from "@zerobias-org/types-core-js";
import { expect } from "chai";

describe('enums', function () {
  it('Should include enums', async function () {
    const types = CoreType.listTypes();
    expect(types).to.include('awsPartition');
    expect(types).to.include('awsService');
    expect(types).to.include('awsCloudRegion');
    expect(types).to.include('awsAccessPolicyStatementOperator');
    expect(types).to.include('awsAccessPolicyStatementEffect');
  });
});

describe('enums#accessPolicyStatementOperator', function () {
  it('Should load enum values', async function () {
    const ct = CoreType.get('awsAccessPolicyStatementOperator');
    expect(ct.enumValues).to.be.ok;
    expect(ct.getEnumInfoValues()).to.be.ok;
    expect(ct.getEnumInfoValues().length).eq(0);

    const expected = {
      key: 'StringEqualsIgnoreCase',
      value: 'string_equals_ignore_case',
      description: undefined
    };
    expect(ct.getEnumMember('string_equals_ignore_case')).to.deep.eq(expected);
    expect(ct.getEnumMember('StringEqualsIgnoreCase')).to.deep.eq(expected);
  });
});

describe('enums#accessPolicyStatementEffect', function () {
  it('Should load enum values', async function () {
    const ct = CoreType.get('awsAccessPolicyStatementEffect');
    expect(ct.enumValues).to.be.ok;
    expect(ct.getEnumInfoValues()).to.be.ok;
    expect(ct.getEnumInfoValues().length).eq(0);

    const expected = {
      key: 'Allow',
      value: 'allow',
      description: undefined
    };
    expect(ct.getEnumMember('allow')).to.deep.eq(expected);
    expect(ct.getEnumMember('Allow')).to.deep.eq(expected);
  });
});

describe('enums#awsPartition', function () {
  it('Should load enum values', async function () {
    const ct = CoreType.get('awsPartition');
    expect(ct.enumValues).to.be.ok;
    expect(ct.getEnumInfoValues()).to.be.ok;
    expect(ct.getEnumInfoValues().length).eq(0);

    const expected = {
      key: 'AwsCn',
      value: 'aws_cn',
      description: 'AWS China Regions'
    };
    expect(ct.getEnumMember('aws_cn')).to.deep.eq(expected);
    expect(ct.getEnumMember('AwsCn')).to.deep.eq(expected);
  });
});

describe('enums#awsService', function () {
  it('Should load enum values', async function () {
    const ct = CoreType.get('awsService');
    expect(ct.enumValues).to.be.ok;
    expect(ct.getEnumInfoValues()).to.be.ok;
    expect(ct.getEnumInfoValues().length).eq(0);

    const expected = {
      key: 'AwsMarketplace',
      value: 'aws_marketplace',
      description: 'AWS Marketplace Catalog'
    };
    expect(ct.getEnumMember('aws_marketplace')).to.deep.eq(expected);
    expect(ct.getEnumMember('AwsMarketplace')).to.deep.eq(expected);
  });
});

describe('enums#awsCloudRegion', function () {
  it('Should load enum values', async function () {
    const ct = CoreType.get('awsCloudRegion');
    expect(ct.enumValues).to.be.ok;
    expect(ct.getEnumInfoValues()).to.be.ok;
    expect(ct.getEnumInfoValues().length).eq(0);

    const expected = {
      key: 'UsWest2',
      value: 'us-west-2',
      description: "US West 2"
    };
    expect(ct.getEnumMember('us-west-2')).to.deep.eq(expected);
    expect(ct.getEnumMember('UsWest2')).to.deep.eq(expected);
  });
});
