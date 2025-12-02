import { expect } from 'chai';
import { NotFoundError } from '../../src/errors/index.js';
import { UUID } from '../../src/index.js';

describe('NotFoundError', function () {

  it('should include the item that is not found in the error message', async function () {
    const id = UUID.generateV1();
    const err = new NotFoundError(id.toString());
    expect(err.message).to.be.eq(`Not found: ${id.toString()}`);
  });

});
