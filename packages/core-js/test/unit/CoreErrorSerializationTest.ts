import { expect } from 'chai';
import {
  CoreError,
  InvalidInputError,
  InvalidStateError,
  NoSuchObjectError,
  UnexpectedError,
} from '../../src/index.js';

describe('CoreError.from', function () {
  it('returns CoreError instance unchanged', function () {
    const orig = new InvalidStateError('pass-through');
    const result = CoreError.from(orig);
    expect(result).to.equal(orig);
  });

  it('deserializes CoreError-shaped plain object to correct subclass', function () {
    const data = {
      key: 'err.no.such.object',
      template: 'No such {type}: {id}',
      statusCode: 404,
      timestamp: new Date(),
      type: 'Resource',
      id: 'abc',
    };
    const result = CoreError.from(data);
    expect(result).to.be.instanceof(NoSuchObjectError);
    expect((result as NoSuchObjectError).type).to.equal('Resource');
    expect((result as NoSuchObjectError).id).to.equal('abc');
  });

  it('preserves subclass identity with just a registered key (minimal input)', function () {
    // Constructor fills defaults for missing fields (msg undefined, timestamp defaults)
    const result = CoreError.from({ key: 'err.invalid.state' });
    expect(result).to.be.instanceof(InvalidStateError);
  });

  it('wraps a plain Error in UnexpectedError and chains its stack', function () {
    const inner = new Error('boom');
    const result = CoreError.from(inner);
    expect(result).to.be.instanceof(UnexpectedError);
    expect((result as UnexpectedError).msg).to.equal('boom');
    expect(result.stack).to.include('Caused by:');
    expect(result.stack).to.include('boom');
  });

  it('wraps a string in UnexpectedError', function () {
    const result = CoreError.from('something went wrong');
    expect(result).to.be.instanceof(UnexpectedError);
    expect((result as UnexpectedError).msg).to.equal('something went wrong');
  });

  it('wraps an arbitrary object (no CoreError shape) in UnexpectedError', function () {
    const result = CoreError.from({ foo: 'bar' });
    expect(result).to.be.instanceof(UnexpectedError);
    expect((result as UnexpectedError).msg).to.include('foo');
  });

  it('extracts .message from a partial error-shaped object', function () {
    const result = CoreError.from({ message: 'something failed', extra: 'data' });
    expect(result).to.be.instanceof(UnexpectedError);
    expect((result as UnexpectedError).msg).to.equal('something failed');
  });

  it('propagates .stack from a partial error-shaped object', function () {
    const result = CoreError.from({ message: 'boom', stack: 'Error: boom\n    at wire' });
    expect(result).to.be.instanceof(UnexpectedError);
    expect(result.stack).to.include('Caused by:');
    expect(result.stack).to.include('at wire');
  });

  it('extracts .timestamp (Date) from a partial error-shaped object', function () {
    const ts = new Date('2020-01-15T12:00:00Z');
    const result = CoreError.from({ message: 'x', timestamp: ts });
    expect(result.timestamp.getTime()).to.equal(ts.getTime());
  });

  it('extracts .timestamp (ISO string) from a partial error-shaped object', function () {
    const result = CoreError.from({ message: 'x', timestamp: '2020-01-15T12:00:00Z' });
    expect(result.timestamp.toISOString()).to.equal('2020-01-15T12:00:00.000Z');
  });

  it('extracts .timestamp (epoch number) from a partial error-shaped object', function () {
    const epoch = 1579089600000; // 2020-01-15T12:00:00Z
    const result = CoreError.from({ message: 'x', timestamp: epoch });
    expect(result.timestamp.getTime()).to.equal(epoch);
  });

  it('ignores invalid .timestamp string and falls back to now', function () {
    const before = Date.now();
    const result = CoreError.from({ message: 'x', timestamp: 'not-a-date' });
    const after = Date.now();
    expect(result.timestamp.getTime()).to.be.at.least(before);
    expect(result.timestamp.getTime()).to.be.at.most(after);
  });

  it('ignores .timestamp of unsupported type (array) without throwing', function () {
    expect(() => CoreError.from({ message: 'x', timestamp: [1, 2, 3] })).to.not.throw();
  });

  it('preserves message, timestamp, and stack together from a partial shape', function () {
    const ts = new Date('2022-06-01T00:00:00Z');
    const result = CoreError.from({
      message: 'gateway down',
      timestamp: ts,
      stack: 'Error: gateway down\n    at originService',
    });
    expect(result).to.be.instanceof(UnexpectedError);
    expect((result as UnexpectedError).msg).to.equal('gateway down');
    expect(result.timestamp.getTime()).to.equal(ts.getTime());
    expect(result.stack).to.include('at originService');
  });

  it('wraps null in UnexpectedError', function () {
    const result = CoreError.from(null);
    expect(result).to.be.instanceof(UnexpectedError);
    expect((result as UnexpectedError).msg).to.equal('null');
  });

  it('wraps undefined in UnexpectedError', function () {
    const result = CoreError.from(undefined);
    expect(result).to.be.instanceof(UnexpectedError);
    expect((result as UnexpectedError).msg).to.equal('undefined');
  });

  it('wraps CoreError-shaped object with unknown key in UnexpectedError', function () {
    const result = CoreError.from({
      key: 'err.totally.unknown',
      template: '{msg}',
      statusCode: 500,
      timestamp: new Date(),
      msg: 'surprise',
    });
    expect(result).to.be.instanceof(UnexpectedError);
  });

  it('end-to-end: Error → from → toJSON preserves all subclass fields', function () {
    const orig = new InvalidInputError('email', 'not-an-email', ['a@b.com', 'c@d.com']);
    const json = CoreError.from(orig).toJSON();
    expect(json).to.have.property('key', 'err.invalid.input');
    expect(json).to.have.property('statusCode', 400);
    expect(json).to.have.property('type', 'email');
    expect(json).to.have.property('value', 'not-an-email');
    expect(json).to.have.property('examples').that.deep.equals(['a@b.com', 'c@d.com']);
  });
});
