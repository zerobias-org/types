import { expect } from 'chai';
import { Arn, AwsService } from '../src/index.js';
import { CoreType, InvalidInputError } from '@zerobias-org/types-core-js';

describe('Arn', function () {

  it('should be included in CoreType.listTypes', async function () {
    expect(CoreType.listTypes()).to.include('arn');
  });

  it('should return a description of the class', async function () {
    const desc = Arn.description();
    expect(desc).to.be.ok;
    expect(desc).to.include('Amazon Resource Name');
  });

  it('should return examples for the class', async function () {
    const examples = Arn.examples();
    expect(examples).to.be.ok;
  });

  it('should validate and parse a valid arn with kebab service name', async function () {
    const arn = await Arn.parse('arn:aws:license-manager::123123123121:dummyId');
    expect(arn).to.be.ok;
    expect(arn instanceof Arn).to.be.true;
    expect(arn.partition.toString()).to.be.equal("aws");
    expect(arn.service.toString()).to.be.equal("license_manager");
    expect(arn.accountId).to.be.equal("123123123121");
    expect(arn.resourceId).to.be.equal("dummyId");
    expect(arn.toString()).to.be.equal("arn:aws:license-manager::123123123121:dummyId");
    expect(arn.isServiceUnknown).to.be.equal(false);
    expect(arn.isRegionUnknown).to.be.equal(false);
    expect(arn.isCloudRegionUnknown).to.be.equal(false);
  });

  it('should validate and parse a valid arn for resource explorer 2', async function () {
    const arn = await Arn.parse('arn:aws:resource-explorer-2:us-east-1:123456789012:view/EC2-Only-View/EXAMPLE8-90ab-cdef-fedc-EXAMPLE11111');
    expect(arn).to.be.ok;
    expect(arn instanceof Arn).to.be.true;
    expect(arn.partition.toString()).to.be.equal("aws");
    expect(arn.service.toString()).to.be.equal("resource_explorer_2");
    expect(arn.accountId).to.be.equal("123456789012");
    expect(arn.resourceType).to.be.equal("view");
    expect(arn.resourceId).to.be.equal("EC2-Only-View/EXAMPLE8-90ab-cdef-fedc-EXAMPLE11111");
    expect(arn.toString()).to.be.equal("arn:aws:resource-explorer-2:us-east-1:123456789012:view/EC2-Only-View/EXAMPLE8-90ab-cdef-fedc-EXAMPLE11111");
    expect(arn.isServiceUnknown).to.be.equal(false);
    expect(arn.isRegionUnknown).to.be.equal(false);
    expect(arn.isCloudRegionUnknown).to.be.equal(false);
  });

  it('should validate and parse a valid arn with kebab partition name', async function () {
    const arn = await Arn.parse('arn:aws-cn:license-manager::123123123121:dummyId');
    expect(arn).to.be.ok;
    expect(arn instanceof Arn).to.be.true;
    expect(arn.partition.toString()).to.be.equal("aws_cn");
    expect(arn.service.toString()).to.be.equal("license_manager");
    expect(arn.accountId).to.be.equal("123123123121");
    expect(arn.resourceId).to.be.equal("dummyId");
    expect(arn.toString()).to.be.equal("arn:aws-cn:license-manager::123123123121:dummyId");
    expect(arn.isServiceUnknown).to.be.equal(false);
    expect(arn.isRegionUnknown).to.be.equal(false);
    expect(arn.isCloudRegionUnknown).to.be.equal(false);
  });

  it('should validate and parse a valid arn', async function () {
    const arn = await Arn.parse('arn:aws:clouddirectory:us-west-2:12345678910:directory/ARIqk1HD-UjdtmcIrJHEvPI');
    expect(arn).to.be.ok;
    expect(arn instanceof Arn).to.be.true;
    expect(arn.partition.toString()).to.be.equal("aws");
    expect(arn.service.toString()).to.be.equal("clouddirectory");
    expect(arn.region?.toString()).to.be.equal("us-west-2");
    expect(arn.cloudRegion?.toString()).to.be.equal("aws_us_west_2");
    expect(arn.accountId).to.be.equal("12345678910");
    expect(arn.resourceType).to.be.equal("directory");
    expect(arn.resourceId).to.be.equal("ARIqk1HD-UjdtmcIrJHEvPI");
    expect(arn.isServiceUnknown).to.be.equal(false);
    expect(arn.isRegionUnknown).to.be.equal(false);
    expect(arn.isCloudRegionUnknown).to.be.equal(false);
  });

  it('should validate and parse a valid acm pca arn', async function () {
    const arn = await Arn.parse('arn:aws:acm-pca:us-east-1:11111111:certificate-authority/12345678-1234-1234-1234-123456789012');
    expect(arn).to.be.ok;
    expect(arn instanceof Arn).to.be.true;
    expect(arn.partition.toString()).to.be.equal("aws");
    expect(arn.service.toString()).to.be.equal("acm_pca");
    expect(arn.region?.toString()).to.be.equal("us-east-1");
    expect(arn.cloudRegion?.toString()).to.be.equal("aws_us_east_1");
    expect(arn.accountId).to.be.equal("11111111");
    expect(arn.resourceType).to.be.equal("certificate-authority");
    expect(arn.resourceId).to.be.equal("12345678-1234-1234-1234-123456789012");
    expect(arn.isServiceUnknown).to.be.equal(false);
    expect(arn.isRegionUnknown).to.be.equal(false);
    expect(arn.isCloudRegionUnknown).to.be.equal(false);
  });

  it('should validate and parse a valid default aws arn', async function () {
    const arn = await Arn.parse('arn:aws:organizations::aws:policy/service_control_policy/p-BuiltInPolicy');
    expect(arn).to.be.ok;
    expect(arn instanceof Arn).to.be.true;
    expect(arn.partition.toString()).to.be.equal("aws");
    expect(arn.service.toString()).to.be.equal("organizations");
    expect(arn.region?.toString()).to.be.undefined;
    expect(arn.cloudRegion?.toString()).to.be.undefined;
    expect(arn.accountId).to.be.equal("aws");
    expect(arn.resourceType).to.be.equal("policy");
    expect(arn.resourceId).to.be.equal("service_control_policy/p-BuiltInPolicy");
    expect(arn.isServiceUnknown).to.be.equal(false);
    expect(arn.isRegionUnknown).to.be.equal(false);
    expect(arn.isCloudRegionUnknown).to.be.equal(false);
  });

  it('should validate and parse a valid arn without region', async function () {
    const arn = await Arn.parse('arn:aws:iam::12345678910:resourceId');
    expect(arn).to.be.ok;
    expect(arn instanceof Arn).to.be.true;
    expect(arn.partition.toString()).to.be.equal("aws");
    expect(arn.service.toString()).to.be.equal("iam");
    expect(arn.region?.toString()).to.be.undefined;
    expect(arn.cloudRegion?.toString()).to.be.undefined;
    expect(arn.accountId).to.be.equal("12345678910");
    expect(arn.resourceId).to.be.equal("resourceId");
    expect(arn.isServiceUnknown).to.be.equal(false);
    expect(arn.isRegionUnknown).to.be.equal(false);
    expect(arn.isCloudRegionUnknown).to.be.equal(false);
  });

  it('should validate and parse a valid arn without accountId', async function () {
    const arn = await Arn.parse('arn:aws:iam:us-west-2::resourceId');
    expect(arn).to.be.ok;
    expect(arn instanceof Arn).to.be.true;
    expect(arn.partition.toString()).to.be.equal("aws");
    expect(arn.service.toString()).to.be.equal("iam");
    expect(arn.region?.toString()).to.be.equal("us-west-2");
    expect(arn.cloudRegion?.toString()).to.be.equal("aws_us_west_2");
    expect(arn.accountId).to.be.undefined;
    expect(arn.resourceId).to.be.equal("resourceId");
    expect(arn.isServiceUnknown).to.be.equal(false);
    expect(arn.isRegionUnknown).to.be.equal(false);
    expect(arn.isCloudRegionUnknown).to.be.equal(false);
  });

  it('should validate and parse a valid arn with wildcards', async function () {
    const arn = await Arn.parse('arn:aws:ia?:us-west-*::*');
    expect(arn).to.be.ok;
    expect(arn instanceof Arn).to.be.true;
    expect(arn.partition.toString()).to.be.equal("aws");
    expect(arn.service.toString()).to.be.equal("ia?");
    expect(arn.region?.toString()).to.be.equal("us-west-*");
    expect(arn.cloudRegion?.toString()).to.be.equal("aws_us_west_*");
    expect(arn.accountId).to.be.undefined;
    expect(arn.resourceId).to.be.equal("*");
    expect(arn.isServiceUnknown).to.be.equal(false);
    expect(arn.isRegionUnknown).to.be.equal(false);
    expect(arn.isCloudRegionUnknown).to.be.equal(false);
  });

  it('should validate and parse a valid arn with variables', async function () {
    const arn = await Arn.parse('arn:aws:service*:us-usRegion*::tables${d}');
    expect(arn).to.be.ok;
    expect(arn instanceof Arn).to.be.true;
    expect(arn.partition.toString()).to.be.equal("aws");
    expect(arn.service.toString()).to.be.equal("service*");
    expect(arn.region?.toString()).to.be.equal("us-usRegion*");
    expect(arn.cloudRegion?.toString()).to.be.equal("aws_us_usRegion*");
    expect(arn.accountId).to.be.undefined;
    expect(arn.resourceId).to.be.equal("tables${d}");
    expect(arn.isServiceUnknown).to.be.equal(false);
    expect(arn.isRegionUnknown).to.be.equal(false);
    expect(arn.isCloudRegionUnknown).to.be.equal(false);
  });

  it('should validate and parse a valid arn with variables containing colon', async function () {
    const arn = await Arn.parse('arn:*:${service}:us-${account:usRegion}:1234:tables/${table:name}');
    expect(arn).to.be.ok;
    expect(arn instanceof Arn).to.be.true;
    expect(arn.partition.toString()).to.be.equal("*");
    expect(arn.service.toString()).to.be.equal("${service}");
    expect(arn.region?.toString()).to.be.equal("us-${account:usRegion}");
    expect(arn.cloudRegion?.toString()).to.be.equal("aws_us_${account:usRegion}");
    expect(arn.accountId).to.be.equal("1234");
    expect(arn.resourceType).to.be.equal("tables");
    expect(arn.resourceId).to.be.equal("${table:name}");
    expect(arn.isServiceUnknown).to.be.equal(false);
    expect(arn.isRegionUnknown).to.be.equal(false);
    expect(arn.isCloudRegionUnknown).to.be.equal(false);
  });

  it('should validate and parse a valid arn with a space in the resource', async function () {
    const arn = await Arn.parse('arn:aws:logs:us-east-1:123456789:log-group:My Log Group:log-stream:My Log Stream');
    expect(arn).to.be.ok;
    expect(arn instanceof Arn).to.be.true;
    expect(arn.partition.toString()).to.be.equal("aws");
    expect(arn.service.toString()).to.be.equal("logs");
    expect(arn.region?.toString()).to.be.equal("us-east-1");
    expect(arn.cloudRegion?.toString()).to.be.equal("aws_us_east_1");
    expect(arn.accountId).to.be.equal("123456789");
    expect(arn.resourceType).to.be.equal("log-group");
    expect(arn.resourceId).to.be.equal("My Log Group:log-stream:My Log Stream");
    expect(arn.isServiceUnknown).to.be.equal(false);
    expect(arn.isRegionUnknown).to.be.equal(false);
    expect(arn.isCloudRegionUnknown).to.be.equal(false);
  });

  it('should validate and parse a valid arn with a reference to latest', async function () {
    const arnString = 'arn:aws:logs:us-east-1:123456789:log-group:' +
      '/aws/lambda/AWSWAFSecurityAutomations-Helper-123AWDSD4w32185:log-stream:2020/12/11/[$LATEST]ABCDEFGHJKLMNOP';
    const arn = await Arn.parse(arnString);
    expect(arn).to.be.ok;
    expect(arn instanceof Arn).to.be.true;
    expect(arn.partition.toString()).to.be.equal("aws");
    expect(arn.service.toString()).to.be.equal("logs");
    expect(arn.region?.toString()).to.be.equal("us-east-1");
    expect(arn.cloudRegion?.toString()).to.be.equal("aws_us_east_1");
    expect(arn.accountId).to.be.equal("123456789");
    expect(arn.resourceType).to.be.equal("log-group");
    expect(arn.resourceId).to.be.equal("/aws/lambda/AWSWAFSecurityAutomations-Helper-123AWDSD4w32185:log-stream:2020/12/11/[$LATEST]ABCDEFGHJKLMNOP");
    expect(arn.isServiceUnknown).to.be.equal(false);
    expect(arn.isRegionUnknown).to.be.equal(false);
    expect(arn.isCloudRegionUnknown).to.be.equal(false);
  });

  // AWS Resource ARN Examples: https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_resource.html
  it('should validate another arn with wildcards', async function () {
    const arn = await Arn.parse('arn:aws:iam::123456789:user/accounting/*');
    expect(arn).to.be.ok;
    expect(arn instanceof Arn).to.be.true;
    expect(arn.partition.toString()).to.be.equal("aws");
    expect(arn.service.toString()).to.be.equal("iam");
    expect(arn.region?.toString()).to.be.undefined;
    expect(arn.cloudRegion?.toString()).to.be.undefined;
    expect(arn.accountId).to.be.equal('123456789');
    expect(arn.resourceId).to.be.equal("accounting/*");
    expect(arn.isServiceUnknown).to.be.equal(false);
    expect(arn.isRegionUnknown).to.be.equal(false);
    expect(arn.isCloudRegionUnknown).to.be.equal(false);
  });

  it('should match arns with a provided pattern', async function () {
    let arnPattern = 'arn:aws:s3:::DOC-EXAMPLE-BUCKET/*/test/*';
    let arn = await Arn.parse('arn:aws:s3:::DOC-EXAMPLE-BUCKET/1/test/object.jpg');
    expect(arn.matches(arnPattern)).to.be.true;
    arn = await Arn.parse('arn:aws:s3:::DOC-EXAMPLE-BUCKET/1/2/test/object.jpg');
    expect(arn.matches(arnPattern)).to.be.true;
    arn = await Arn.parse('arn:aws:s3:::DOC-EXAMPLE-BUCKET/1/2/test/3/object.jpg ');
    expect(arn.matches(arnPattern)).to.be.true;
    arn = await Arn.parse('arn:aws:s3:::DOC-EXAMPLE-BUCKET/1/2/3/test/4/object.jpg');
    expect(arn.matches(arnPattern)).to.be.true;
    arn = await Arn.parse('arn:aws:s3:::DOC-EXAMPLE-BUCKET/1///test///object.jpg');
    expect(arn.matches(arnPattern)).to.be.true;
    arn = await Arn.parse('arn:aws:s3:::DOC-EXAMPLE-BUCKET/1/test/.jpg');
    expect(arn.matches(arnPattern)).to.be.true;
    arn = await Arn.parse('arn:aws:s3:::DOC-EXAMPLE-BUCKET//test/object.jpg');
    expect(arn.matches(arnPattern)).to.be.true;
    arn = await Arn.parse('arn:aws:s3:::DOC-EXAMPLE-BUCKET/1/test/');
    expect(arn.matches(arnPattern)).to.be.true;

    arn = await Arn.parse('arn:aws:s3:::DOC-EXAMPLE-BUCKET/1-test/object.jpg');
    expect(arn.matches(arnPattern)).to.be.false;
    arn = await Arn.parse('arn:aws:s3:::DOC-EXAMPLE-BUCKET/test/object.jpg');
    expect(arn.matches(arnPattern)).to.be.false;
    arn = await Arn.parse('arn:aws:s3:::DOC-EXAMPLE-BUCKET/1/2/test.jpg');
    expect(arn.matches(arnPattern)).to.be.false;
  });

  it('should match arns with the pattern as instance', async function () {
    const arn = await Arn.parse('arn:aws:s3:::DOC-EXAMPLE-BUCKET/*/test/*');
    expect(arn.matches('arn:aws:s3:::DOC-EXAMPLE-BUCKET/1/2/test/object.jpg')).to.be.true;
    expect(arn.matches('arn:aws:s3:::DOC-EXAMPLE-BUCKET/1/2/test/object.jpg')).to.be.true;
    expect(arn.matches('arn:aws:s3:::DOC-EXAMPLE-BUCKET/1/2/test/3/object.jpg')).to.be.true;
    expect(arn.matches('arn:aws:s3:::DOC-EXAMPLE-BUCKET/1/2/3/test/4/object.jpg')).to.be.true;
    expect(arn.matches('arn:aws:s3:::DOC-EXAMPLE-BUCKET/1///test///object.jpg')).to.be.true;
    expect(arn.matches('arn:aws:s3:::DOC-EXAMPLE-BUCKET/1/test/.jpg')).to.be.true;
    expect(arn.matches('arn:aws:s3:::DOC-EXAMPLE-BUCKET//test/object.jpg')).to.be.true;
    expect(arn.matches('arn:aws:s3:::DOC-EXAMPLE-BUCKET/1/test/')).to.be.true;

    expect(arn.matches('arn:aws:s3:::DOC-EXAMPLE-BUCKET/1-test/object.jpg')).to.be.false;
    expect(arn.matches('arn:aws:s3:::DOC-EXAMPLE-BUCKET/test/object.jpg')).to.be.false;
    expect(arn.matches('arn:aws:s3:::DOC-EXAMPLE-BUCKET/1/2/test.jpg')).to.be.false;
  });

  it('should not match arns with variables', async function () {
    let arnPattern = 'arn:aws:dynamodb:us-east-2:account-id:table/${aws:username}';
    let arn = await Arn.parse('arn:aws:dynamodb:us-east-2:12345:table/bob');
    expect(arn.matches(arnPattern)).to.be.false;

    arnPattern = 'arn:aws:dynamodb:us-east-2:12345:table/bob';
    arn = await Arn.parse('arn:aws:dynamodb:us-east-2:12345:table/${aws:username}');
    expect(arn.matches(arnPattern)).to.be.false;
  });

  it('should fail parsing an invalid arn with variables', async function () {
    try {
      await Arn.parse('arn:*:${}:us-${account:usRegion}::tables/${table:name}');
      expect.fail('expected error not thrown');
    } catch (err) {
      expect(err).to.be.instanceOf(InvalidInputError);
    }
  });

  it('should fail parsing an invalid arn with wildcards', async function () {
    try {
      await Arn.parse('arn:aws:us-east-2*');
      expect.fail('expected error not thrown');
    } catch (err) {
      expect(err).to.be.instanceOf(InvalidInputError);
    }
  });

  it('should reject an arn with an invalid partition', async function () {
    try {
      await Arn.parse('arn:awsx:clouddirectory:us-west-2:12345678910:directory/ARIqk1HD-UjdtmcIrJHEvPI');
    } catch (e) {
      expect(e instanceof InvalidInputError).to.be.true;
      return;
    }
    expect.fail('Should not parse an arn with an invalid partition');
  });

  it('should reject an invalid arn', async function () {
    try {
      await Arn.parse('invalidArn');
    } catch (e) {
      expect(e instanceof InvalidInputError).to.be.true;
      return;
    }
    expect.fail('Should not parse an invalid arn');
  });

  it('should match long arn without hanging', async function () {
    const arn = new Arn('arn:*:iam::*:role/0123456789012345678901234567890');
    expect(arn).to.be.ok;
    expect(arn).instanceOf(Arn);
    expect(arn.partition.toString()).to.be.equal('*');
    expect(arn.service).to.be.equal(AwsService.Iam);
    expect(arn.region).to.be.undefined;
    expect(arn.cloudRegion).to.be.undefined;
    expect(arn.accountId).to.be.equal('*');
    expect(arn.resourceType).to.be.equal('role');
    expect(arn.resourceId).to.be.equal('0123456789012345678901234567890');
    expect(arn.isServiceUnknown).to.be.equal(false);
    expect(arn.isRegionUnknown).to.be.equal(false);
    expect(arn.isCloudRegionUnknown).to.be.equal(false);
  });

  it('should validate arn with a * wildcard in partition', async function () {
    const arn = new Arn('arn:foo*bar:iam::*:resourceId');
    expect(arn).to.be.ok;
    expect(arn).instanceOf(Arn);
    expect(arn.partition.toString()).to.be.equal('foo*bar');
    expect(arn.service).to.be.equal(AwsService.Iam);
    expect(arn.region).to.be.undefined;
    expect(arn.cloudRegion).to.be.undefined;
    expect(arn.accountId).to.be.equal('*');
    expect(arn.resourceType).to.be.equal(undefined);
    expect(arn.resourceId).to.be.equal('resourceId');
    expect(arn.isServiceUnknown).to.be.equal(false);
    expect(arn.isRegionUnknown).to.be.equal(false);
    expect(arn.isCloudRegionUnknown).to.be.equal(false);
  });

  it('should validate arn a ? with wildcard in partition', async function () {
    const arn = new Arn('arn:?bar:iam::*:resourceId');
    expect(arn).to.be.ok;
    expect(arn).instanceOf(Arn);
    expect(arn.partition.toString()).to.be.equal('?bar');
    expect(arn.service).to.be.equal(AwsService.Iam);
    expect(arn.region).to.be.undefined;
    expect(arn.cloudRegion).to.be.undefined;
    expect(arn.accountId).to.be.equal('*');
    expect(arn.resourceType).to.be.equal(undefined);
    expect(arn.resourceId).to.be.equal('resourceId');
    expect(arn.isServiceUnknown).to.be.equal(false);
    expect(arn.isRegionUnknown).to.be.equal(false);
    expect(arn.isCloudRegionUnknown).to.be.equal(false);
  });

  it('should return true for unknown service', async function () {
    const arn = new Arn('arn:aws:unknown-servoce::*:resourceId');
    expect(arn.isServiceUnknown).to.be.equal(true);
    expect(arn.isRegionUnknown).to.be.equal(false);
    expect(arn.isCloudRegionUnknown).to.be.equal(false);
  });

  it('should return true for unknown region and cloud region', async function () {
    const arn = new Arn('arn:aws:iam:unknown-region:*:resourceId');
    expect(arn.isServiceUnknown).to.be.equal(false);
    expect(arn.isRegionUnknown).to.be.equal(true);
    expect(arn.isCloudRegionUnknown).to.be.equal(true);
  });
});
