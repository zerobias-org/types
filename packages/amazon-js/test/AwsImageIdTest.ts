import { expect } from 'chai';
import { AwsImageId } from '../src/index.js';
import { InvalidInputError } from '@zerobias-org/types-core-js';

describe('AwsImageId', function () {
  it('should return a description of the class', async function () {
    const desc = AwsImageId.description();
    expect(desc).to.be.ok;
    expect(desc).to.include('AWS ECR Image Identifier');
  });

  it('should return examples for the class', async function () {
    const examples = AwsImageId.examples();
    expect(examples).to.be.ok;
  });

  it('should validate and parse a valid awsImageId', async function () {
    const awsImageId = await AwsImageId.parse(
      'sha256:881befbe6f54c1e85029fe3a11554342bf765a0849600ecb8fa2f922798b4925:trusty'
    );
    expect(awsImageId).to.be.ok;
    expect(awsImageId).instanceOf(AwsImageId);
    expect(awsImageId.digest).to.be.equal(
      'sha256:881befbe6f54c1e85029fe3a11554342bf765a0849600ecb8fa2f922798b4925'
    );
    expect(awsImageId.tag).to.be.equal('trusty');
    expect(awsImageId.toString()).to.be.equal(
      'sha256:881befbe6f54c1e85029fe3a11554342bf765a0849600ecb8fa2f922798b4925:trusty'
    );
  });

  it('should validate and parse a valid awsImageId with a semver tag', async function () {
    const awsImageId = await AwsImageId.parse(
      'sha256:881befbe6f54c1e85029fe3a11554342bf765a0849600ecb8fa2f922798b4925:v2.1.0'
    );
    expect(awsImageId).to.be.ok;
    expect(awsImageId).instanceOf(AwsImageId);
    expect(awsImageId.digest).to.be.equal(
      'sha256:881befbe6f54c1e85029fe3a11554342bf765a0849600ecb8fa2f922798b4925'
    );
    expect(awsImageId.tag).to.be.equal('v2.1.0');
    expect(awsImageId.toString()).to.be.equal(
      'sha256:881befbe6f54c1e85029fe3a11554342bf765a0849600ecb8fa2f922798b4925:v2.1.0'
    );
  });

  it('should validate and parse a valid awsImageId with a snapshot tag', async function () {
    const awsImageId = await AwsImageId.parse(
      'sha256:881befbe6f54c1e85029fe3a11554342bf765a0849600ecb8fa2f922798b4925:v2.1.0-SNAPSHOT'
    );
    expect(awsImageId).to.be.ok;
    expect(awsImageId).instanceOf(AwsImageId);
    expect(awsImageId.digest).to.be.equal(
      'sha256:881befbe6f54c1e85029fe3a11554342bf765a0849600ecb8fa2f922798b4925'
    );
    expect(awsImageId.tag).to.be.equal('v2.1.0-SNAPSHOT');
    expect(awsImageId.toString()).to.be.equal(
      'sha256:881befbe6f54c1e85029fe3a11554342bf765a0849600ecb8fa2f922798b4925:v2.1.0-SNAPSHOT'
    );
  });

  it('should validate and parse a valid awsImageId without tag', async function () {
    const awsImageId = await AwsImageId.parse(
      'sha256:881befbe6f54c1e85029fe3a11554342bf765a0849600ecb8fa2f922798b4925'
    );
    expect(awsImageId).to.be.ok;
    expect(awsImageId).instanceOf(AwsImageId);
    expect(awsImageId.digest).to.be.equal(
      'sha256:881befbe6f54c1e85029fe3a11554342bf765a0849600ecb8fa2f922798b4925'
    );
    expect(awsImageId.toString()).to.be.equal(
      'sha256:881befbe6f54c1e85029fe3a11554342bf765a0849600ecb8fa2f922798b4925'
    );
  });

  it('should reject an awsImageId with an invalid digest', async function () {
    try {
      await AwsImageId.parse('sha256:881befbe6f54');
      expect.fail('Should not parse an awsImageId with an invalid digest');
    } catch (e) {
      expect(e instanceof InvalidInputError).to.be.true;
      return;
    }
  });

  it('should reject an awsImageId with an invalid tag', async function () {
    try {
      await AwsImageId.parse(
        'sha256:881befbe6f54c1e85029fe3a11554342bf765a0849600ecb8fa2f922798b4925:123/abc'
      );
      expect.fail('Should not parse an awsImageId with an invalid tag');
    } catch (e) {
      expect(e instanceof InvalidInputError).to.be.true;
      return;
    }
  });

  it('should reject an awsImageId with no tag and a trailing semicolon', async function () {
    try {
      await AwsImageId.parse('sha256:881befbe6f54c1e85029fe3a11554342bf765a0849600ecb8fa2f922798b4925:');
      expect.fail('Should not parse an invalid awsImageId');
    } catch (e) {
      expect(e instanceof InvalidInputError).to.be.true;
      return;
    }
  });

  it('should reject an invalid awsImageId', async function () {
    try {
      await AwsImageId.parse('sh:invalidawsImageId');
      expect.fail('Should not parse an invalid awsImageId');
    } catch (e) {
      expect(e instanceof InvalidInputError).to.be.true;
      return;
    }
  });
});
