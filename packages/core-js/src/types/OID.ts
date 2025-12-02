import { StringFormat } from './StringFormat.js';
import { IllegalArgumentError, InvalidInputError } from '../errors/index.js';
import { CoreType } from '../CoreType.js';

export type OIDInput = string | number | Array<number> | Array<string>;
/**
 * Class representing an OID (Object Identifier)
 */
export class OID extends StringFormat<OID> {
  private static coreType:CoreType = CoreType.get('oid');

  oid: number[];

  constructor(oid: OIDInput) {
    super();
    if (!oid) {
      throw new InvalidInputError('oid', oid, OID.examples());
    }

    this.oid = [];
    if (Array.isArray(oid)) {
      if (oid.length === 0) {
        throw new InvalidInputError('oid', oid, OID.examples());
      }
      for (let i = 0; i < oid.length; i++) {
        const value = parseInt(oid[i].toString(), 10);
        if (Number.isNaN(value) || value < 0) {
          throw new InvalidInputError('oid', oid, OID.examples());
        }
        this.oid.push(value);
      }
    } else if (typeof oid === 'string' && oid.startsWith('{')) {
      const s = oid.substring(1, oid.length - 1);
      if (s.length > 0) {
        const parts = s.split(',');
        for (let i = 0; i < parts.length; i++) {
          const value = parseInt(parts[i], 10);
          if (Number.isNaN(value) || value < 0) {
            throw new InvalidInputError('oid', oid, OID.examples());
          }
          this.oid.push(value);
        }
      }
    } else {
      const s = oid.toString().trim();
      if (s.length === 0) {
        throw new InvalidInputError('oid', oid, OID.examples());
      }
      const parts = s.split('.');
      for (let i = 0; i < parts.length; i++) {
        const value = parseInt(parts[i], 10);
        if (Number.isNaN(value)) {
          throw new InvalidInputError('oid', oid, OID.examples());
        }
        this.oid.push(value);
      }
    }
  }

  static description(): string {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  static async parse(input: string): Promise<OID> {
    return new OID(input);
  }

  toString(): string {
    return this.oid.join('.');
  }

  toPostgres(self: OID): any {
    let s = '{';
    s += this.oid.join(',');
    s += '}';
    return s;
  }

  equals(other?: any): boolean {
    return other && other instanceof OID
      ? other.oid === this.oid
      : false;
  }

  value(): readonly number[] {
    return this.oid;
  }

  next(): OID {
    const next:number[] = [];
    for (let i = 0; i < this.oid.length; i++) {
      if ((i + 1) < this.oid.length) {
        next.push(this.oid[i]);
      } else {
        next.push(this.oid[i] + 1);
      }
    }
    return new OID(next);
  }

  static between(o1: OID | null, o2: OID | null): OID {
    if (!(o1 || o2)) {
      throw new IllegalArgumentError('At least one OID must be provided');
    }

    let low = o1?.oid;
    let high = o2?.oid;
    if (o1 && o2 && OID.compare(o1, o2) > 0) {
      low = o2?.oid;
      high = o1?.oid;
    }
    const len = Math.max(low?.length ?? 0, high?.length ?? 0);
    const mid:number[] = [];
    for (let i = 0; i < len; i++) {
      const v1 = low ? low[i] : Math.floor(Math.min(high![i] * 0.75, 1000));
      const v2 = high ? high[i] : Math.ceil(low![i] * 1.25);
      if (v1 === v2) {
        mid.push(v1);
      } else {
        const midpoint = (v2 - v1) / 2.0;
        const whole = Math.floor(midpoint);
        const decimal = midpoint - whole;
        mid.push(v1 + whole);

        if (low && decimal > 0) {
          let nextVal = 0;
          if ((i + 1) < low.length) {
            nextVal = low[(i + 1)];
          }
          mid.push(nextVal + Math.floor(decimal * 1000));
        }
        break;
      }
    }
    return new OID(mid);
  }

  static compare(o1: OID, o2: OID): number {
    const len = Math.min(o1.oid.length, o2.oid.length);
    for (let i = 0; i < len; i++) {
      const v1 = o1.oid[i];
      const v2 = o2.oid[i];
      if (v2 > v1) {
        return -1;
      } if (v2 < v1) {
        return 1;
      }
    }
    return o1.oid.length - o2.oid.length;
  }
}
