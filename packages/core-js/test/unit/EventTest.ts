/* eslint-disable */
import { expect } from 'chai';
import { Event, EventImpl, EventKind } from '../../src/index.js';
import { ChangeOperation } from '../../generated/model/index.js';
import { UUID } from '../../src/types/UUID.js';

describe('Event', function () {

  it('should create a new Event', async function () {
    const ce = new EventImpl<string>('Test', 'somedata', UUID.generateV1(), UUID.generateV4(), UUID.generateV4(), 'foo');
    expect(ce).to.be.ok;
    expect(ce.kind).to.be.eq(EventKind.Base);
    expect(ce.type).to.be.not.null;
    expect(ce.data).to.be.eq('somedata');
  });

});
