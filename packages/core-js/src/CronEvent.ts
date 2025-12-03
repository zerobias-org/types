import { EventKind, EventKindDef } from '../generated/model/index.js';
import { UUID } from './types/UUID.js';
import { Event, EventImpl } from './Event.js';

const EVENT_TYPE = 'cron';

export interface CronEvent<T> extends Event<T> {
  cronId: string;
  cronType: string,
}

/**
* Implementation for a Cron Event.
*/
export class CronEventImpl<T> extends EventImpl<T> implements CronEvent<T> {
  /**
   * id of the cron schedule that triggered the event
   */
  readonly _cronId: string;

  /**
   * Type of Cron Event. i.e. cron.trigger, cron.oauth_refresh etc...
   * The fully qualified event `type` will be `cron.${cronType}`
   */
  readonly _cronType: string;

  constructor(
    data: T,
    cronType: string,
    cronId: string,
    id?: UUID,
    principalId?: UUID,
    orgId?: UUID,
    service?: string
  ) {
    super(
      `${EVENT_TYPE}.${cronType}`,
      data,
      id ?? UUID.generateV1(),
      principalId,
      orgId,
      service
    );
    this._cronType = cronType;
    this._cronId = cronId;
  }

   
  get kind(): EventKindDef {
    return EventKind.Cron;
  }

  get cronId(): string {
    return this._cronId;
  }

  get cronType(): string {
    return this._cronType;
  }

  static override from(data: Record<string, any>) : Event<any> {
    return new CronEventImpl(
      data.data,
      data.cronType,
      data.cronId,
      data.id,
      data.principalId,
      data.orgId,
      data.service
    );
  }

  toJSON(): string {
    return JSON.stringify({
      id: this.id,
      kind: this.kind,
      type: this.type,
      cronType: this.cronType,
      principalId: this.principalId,
      orgId: this.orgId,
      service: this.service,
      data: this.data,
      cronId: this.cronId,
    });
  }

  toString(): string {
    // eslint-disable-next-line max-len
    return `CronEvent [id=${this.id}, cronId=${this.cronId}, cronType=${this.cronType} principalId=${this.principalId}, orgId=${this.orgId}, service=${this.service}]`;
  }
}
