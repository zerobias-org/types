import validator from 'validator';
import * as uuid from 'uuid';
import { StringFormat } from './StringFormat.js';
import { InvalidInputError } from '../errors/index.js';
import { CoreType } from '../CoreType.js';

export const enum Version {
  V1,
  V3,
  V4,
  V5
}

/**
 * Class representing a UUID
 */
export class UUID extends StringFormat<UUID> {
  private static _coreType: ReturnType<typeof CoreType.get> | null = null;

  private static get coreType() {
    if (!UUID._coreType) UUID._coreType = CoreType.get('uuid');
    return UUID._coreType;
  }

  private id: string;

  constructor(id: string) {
    super();
    if (validator.isUUID(id)) {
      this.id = id;
    } else {
      throw new InvalidInputError('UUID', id, UUID.examples());
    }
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  static async parse(input: string): Promise<UUID> {
    if (validator.isUUID(input)) {
      return new UUID(input);
    }
    throw new InvalidInputError('UUID', input);
  }

  static generateV1(): UUID {
    return new UUID(uuid.v1());
  }

  static generateV3(name: string, namespace: UUID): UUID {
    return new UUID(uuid.v3(name, `${namespace}`));
  }

  static generateV4(): UUID {
    return new UUID(uuid.v4());
  }

  static generateV5(name: string, namespace: UUID): UUID {
    return new UUID(uuid.v5(name, `${namespace}`));
  }

  public toString(): string {
    return this.id;
  }

  equals(other?: any): boolean {
    return other && other instanceof UUID
      ? other.id === this.id
      : false;
  }

  version(): Version {
    if (validator.isUUID(this.id, 3)) {
      return Version.V3;
    } if (validator.isUUID(this.id, 4)) {
      return Version.V4;
    } if (validator.isUUID(this.id, 5)) {
      return Version.V5;
    }
    // XXX process of elimination for v1
    return Version.V1;
  }
}

// Lazy nil instance getter to avoid circular dependency at module load time
let _nil: UUID | null = null;
export function getNilUUID(): UUID {
  if (!_nil) _nil = new UUID('00000000-0000-0000-0000-000000000000');
  return _nil;
}
