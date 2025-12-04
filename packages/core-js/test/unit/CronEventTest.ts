 
import { expect } from 'chai';
import { EventKind } from '../../src/index.js';
import { ChangeOperation } from '../../generated/model/index.js';
import { UUID } from '../../src/types/UUID.js';
import { CronEventImpl } from '../../src/CronEvent.js';

describe('CronEvent', function () {

  it('should handle nulls for all optional params', async function () {
    const ce = new CronEventImpl<string>('testdata', 'trigger', 'cronId')
    expect(ce).to.be.ok;
    expect(ce.kind).to.be.eq(EventKind.Cron);
    expect(ce.id).to.be.not.null;
    expect(ce.type).to.eq('cron.trigger');
    expect(ce.cronType).to.eq('trigger');
    expect(ce.cronId).to.eq('cronId');
    
    const deserialized = CronEventImpl.from(ce);
    expect(deserialized).to.be.ok;
    expect(deserialized.kind).to.be.eq(EventKind.Cron);
    expect(deserialized.id).to.be.not.null;
    expect(deserialized.type).to.eq('cron.trigger');
    expect(deserialized['cronType']).to.eq('trigger');
    expect(deserialized['cronId']).to.eq('cronId');
  });

  it('should handle values for all optional params', async function () {
    const ce = new CronEventImpl<string>('testdata', 'trigger', 'cronId', UUID.generateV1(), UUID.generateV1(), UUID.generateV1(), 'testservice');
    expect(ce).to.be.ok;
    expect(ce.kind).to.be.eq(EventKind.Cron);
    expect(ce.service).to.be.eq('testservice');
    expect(ce.id).to.be.not.null;
    expect(ce.principalId).to.be.not.null;
    expect(ce.orgId).to.be.not.null;
    expect(ce.type).to.eq('cron.trigger');
    expect(ce.cronType).to.eq('trigger');
    expect(ce.cronId).to.eq('cronId');
    
    const deserialized = CronEventImpl.from(ce);
    expect(deserialized).to.be.ok;
    expect(deserialized.kind).to.be.eq(EventKind.Cron);
    expect(deserialized.service).to.be.eq('testservice');
    expect(deserialized.id).to.be.not.null;
    expect(deserialized.principalId).to.be.not.null;
    expect(deserialized.orgId).to.be.not.null;
    expect(deserialized.type).to.eq('cron.trigger');
    expect(deserialized['cronType']).to.eq('trigger');
    expect(deserialized['cronId']).to.eq('cronId');
  });

});
