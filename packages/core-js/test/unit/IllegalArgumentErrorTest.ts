import { expect } from 'chai';
import { IllegalArgumentError } from '../../src/errors/index.js';

describe('IllegalArgumentError', function () {

  it('should include the argument in the error message', async function () {
    const msg = 'foo is illegal';
    const err = new IllegalArgumentError(msg);
    expect(err.message).to.be.eq(msg);
  });

});
