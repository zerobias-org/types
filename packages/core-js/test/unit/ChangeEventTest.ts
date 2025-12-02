/* eslint-disable */
import { expect } from 'chai';
import { ChangeEventImpl, EventKind } from '../../src/index.js';
import { ChangeOperation } from '../../generated/model.js';
import { UUID } from '../../src/types/UUID.js';

describe('ChangeEvent', function () {

  it('should handle nulls for all optional params', async function () {
    const ce = new ChangeEventImpl<string>(ChangeOperation.Create, 'Test', 'create');
    expect(ce).to.be.ok;
    expect(ce.kind).to.be.eq(EventKind.Change);
    expect(ce.op).to.be.eq(ChangeOperation.Create);
    expect(ce.id).to.be.not.null;
    expect(ce.type).to.be.not.null;
  });

  it('should handle values for all optional params', async function () {
    const ce = new ChangeEventImpl<string>(ChangeOperation.Update, 'Test', 'update', UUID.generateV1(), UUID.generateV4(), UUID.generateV4(), 'foo', 'create');
    expect(ce).to.be.ok;
    expect(ce.kind).to.be.eq(EventKind.Change);
    expect(ce.op).to.be.eq(ChangeOperation.Update);
    expect(ce.type).to.be.not.null;
    expect(ce.before).to.be.eq('create');
    expect(ce.data).to.be.eq('update');
  });

});
