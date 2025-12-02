import { expect } from 'chai';
import { CoreError, NoSuchObjectError, ResultLimitExceededError } from "../../src/index.js";

describe('CoreError', function () {
  it('should create an error from a JSON document', async function () {
    const json = {
      key: 'err.result.limit.exceeded',
      template: '{requested} results requested but {returned} results returned',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      requested: 42,
      returned: 420,
    };
    const ce = CoreError.deserialize(json);
    expect(ce).to.be.instanceof(ResultLimitExceededError);
    const rle = ce as ResultLimitExceededError;
    expect(rle.timestamp).to.be.deep.eq(json.timestamp);
    expect(rle.requested).to.be.eq(42);
    expect(rle.returned).to.be.eq(420);
  });

  it('should serialize an error to a JSON document', async function () {
    const err = new ResultLimitExceededError(42, 420);
    const json = err.toJSON();
    expect(err.timestamp).to.be.deep.eq(json.timestamp);
    expect(json.requested).to.be.eq(42);
    expect(json.returned).to.be.eq(420);
  });

  it('should serialize and deserialize losslessly', async function () {
    const orig = new ResultLimitExceededError(42, 420);
    const json = orig.toJSON();
    const err = CoreError.deserialize(json);
    expect(err).to.be.instanceof(ResultLimitExceededError);
    const rle = err as ResultLimitExceededError;
    expect(rle.timestamp).to.be.deep.eq(orig.timestamp);
    expect(rle.requested).to.be.eq(orig.requested);
    expect(rle.returned).to.be.eq(orig.returned);
  });

  it('should serialize and deserialize losslessly', async function () {
    const orig = new NoSuchObjectError('foo', 'bar');
    const json = orig.toJSON();
    const err = CoreError.deserialize(json);
    expect(err).to.be.instanceof(NoSuchObjectError);
    const narrowed = err as NoSuchObjectError;
    expect(narrowed.timestamp).to.be.deep.eq(orig.timestamp);
    expect(narrowed.type).to.be.eq(orig.type);
    expect(narrowed.id).to.be.eq(orig.id);
  });

});
