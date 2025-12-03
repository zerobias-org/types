import { EventKind, EventKindDef } from '../generated/model/index.js';
import { UUID } from './types/UUID.js';

export interface Event<T> {
  /**
   * The type of change operation
   */
  id: UUID;

  /**
   * The type of the event
   */
  type: string;

  /**
   * The value before the change
   */
  data: T;

  /**
   * The principal who triggered the event
   */
  principalId?: UUID;

  /**
   * The org the principal was using
   */
  orgId?: UUID;

  /**
   * The service that created the event
   */
  service?: string;

  kind: EventKindDef;

  toJSON(): string;

  toString(): string;
}

/**
* Wrapper for a response with a paged result set.
*/
export class EventImpl<T> implements Event<T> {
  /**
   * The type of change operation
   */
  private _id: UUID;

  /**
   * The type of the event
   */
  private _type: string;

  /**
   * The value before the change
   */
  private _data: T;

  /**
   * The principal who triggered the event
   */
  private _principalId?: UUID;

  /**
   * The org the principal was using
   */
  private _orgId?: UUID;

  /**
   * The service that created the event
   */
  private _service?: string;

  constructor(
    type: string,
    data: T,
    id?: UUID,
    principalId?: UUID,
    orgId?: UUID,
    service?: string
  ) {
    this._type = type;
    this._data = data;
    this._id = id ?? UUID.generateV1();
    this._principalId = principalId;
    this._orgId = orgId;
    this._service = service;
  }

  get id(): UUID {
    return this._id;
  }

  get type(): string {
    return this._type;
  }

  get data(): T {
    return this._data;
  }

  get principalId(): UUID | undefined {
    return this._principalId;
  }

  get orgId(): UUID | undefined {
    return this._orgId;
  }

  get service(): string | undefined {
    return this._service;
  }

   
  get kind(): EventKindDef {
    return EventKind.Base;
  }

  static from(data: Record<string, any>) : Event<any> {
    return new EventImpl(
      data.type,
      data.data,
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
      data: this.data,
      principalId: this.principalId,
      orgId: this.orgId,
      service: this.service,
    });
  }

  toString(): string {
    // eslint-disable-next-line max-len
    return `Event [id=${this.id}, type=${this.type}, data=${this.data}, principalId=${this.principalId}, orgId=${this.orgId}, service=${this.service}]`;
  }
}
