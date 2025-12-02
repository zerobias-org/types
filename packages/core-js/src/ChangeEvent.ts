import { ChangeOperationDef, EventKind, EventKindDef } from '../generated/model.js';
import { UUID } from './types/UUID.js';
import { Event, EventImpl } from './Event.js';

const EVENT_TYPE = 'change';

export interface ChangeEvent<T> extends Event<T> {
  /**
   * The type of change operation
   */
  op: ChangeOperationDef;

  /**
   * The type of the object that has changed
   */
  objectType: string;

  /**
   * The value before the change
   */
  before?: T;
}

/**
* Wrapper for a response with a paged result set.
*/
export class ChangeEventImpl<T> extends EventImpl<T> implements ChangeEvent<T> {
  /**
   * The type of change operation
   */
  private _op: ChangeOperationDef;

  /**
   * The type of the object that has changed
   */
  private _objectType: string;

  /**
   * The value before the change
   */
  private _before?: T;

  constructor(
    op: ChangeOperationDef,
    objectType: string,
    data: T,
    id?: UUID,
    principalId?: UUID,
    orgId?: UUID,
    service?: string,
    before?: T
  ) {
    super(
      `${EVENT_TYPE}.${objectType}`,
      data,
      id ?? UUID.generateV1(),
      principalId,
      orgId,
      service
    );
    this._op = op;
    this._objectType = objectType;
    this._before = before;
  }

  get op(): ChangeOperationDef {
    return this._op;
  }

  get objectType(): string {
    return this._objectType;
  }

  get before(): T | undefined {
    return this._before;
  }

  get after(): T | undefined {
    return this.data;
  }

  // eslint-disable-next-line class-methods-use-this
  get kind(): EventKindDef {
    return EventKind.Change;
  }

  static override from(data: Record<string, any>) : Event<any> {
    return new ChangeEventImpl(
      data.op,
      data.objectType,
      data.data,
      data.id,
      data.principalId,
      data.orgId,
      data.service,
      data.before
    );
  }

  toJSON(): string {
    return JSON.stringify({
      id: this.id,
      kind: this.kind,
      type: this.type,
      op: this.op,
      objectType: this.objectType,
      principalId: this.principalId,
      orgId: this.orgId,
      service: this.service,
      before: this.before,
      data: this.data,
    });
  }

  toString(): string {
    // eslint-disable-next-line max-len
    return `ChangeEvent [id=${this.id}, op=${this.op}, objectType=${this.objectType}, principalId=${this.principalId}, orgId=${this.orgId}, service=${this.service}, before=${this.before}, after=${this.after}]`;
  }
}
