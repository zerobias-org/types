import { expect } from 'chai';
import { CoreError, NoSuchObjectError, ResultLimitExceededError, UnexpectedError, IllegalArgumentError } from "../../src/index.js";

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

  describe('cause support', function () {
    it('should preserve the cause error', async function () {
      const cause = new Error('original error');
      const err = new NoSuchObjectError('Resource', '123', new Date(), cause);
      expect(err.cause).to.be.eq(cause);
      expect(err.cause?.message).to.be.eq('original error');
    });

    it('should append cause stack trace to error stack', async function () {
      const cause = new Error('original error');
      const err = new NoSuchObjectError('Resource', '123', new Date(), cause);
      expect(err.stack).to.include('Caused by:');
      expect(err.stack).to.include('original error');
    });

    it('should work without a cause', async function () {
      const err = new NoSuchObjectError('Resource', '123');
      expect(err.cause).to.be.undefined;
      expect(err.stack).to.not.include('Caused by:');
    });

    it('should preserve cause in UnexpectedError', async function () {
      const cause = new Error('database connection failed');
      const err = new UnexpectedError('Operation failed', 500, new Date(), cause);
      expect(err.cause).to.be.eq(cause);
      expect(err.stack).to.include('Caused by:');
      expect(err.stack).to.include('database connection failed');
    });

    it('should preserve cause in IllegalArgumentError', async function () {
      const cause = new TypeError('Invalid type');
      const err = new IllegalArgumentError('Invalid argument provided', new Date(), cause);
      expect(err.cause).to.be.eq(cause);
      expect(err.stack).to.include('Caused by:');
      expect(err.stack).to.include('Invalid type');
    });

    it('should chain multiple errors', async function () {
      const rootCause = new Error('root cause');
      const middleError = new UnexpectedError('middle error', 500, new Date(), rootCause);
      const topError = new NoSuchObjectError('Resource', '123', new Date(), middleError);

      expect(topError.cause).to.be.eq(middleError);
      expect(topError.stack).to.include('Caused by:');
      expect(topError.stack).to.include('middle error');
      // The middle error's stack should also contain the root cause
      expect(middleError.stack).to.include('root cause');
    });
  });

});
