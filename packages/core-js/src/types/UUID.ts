import { v1, v3, v4, v5, validate as isUUID, version as uuidVersion, MAX } from 'uuid';
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
    if (isUUID(id)) {
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
    if (isUUID(input)) {
      return new UUID(input);
    }
    throw new InvalidInputError('UUID', input);
  }

  static generateV1(): UUID {
    return new UUID(v1());
  }

  static generateV3(name: string, namespace: UUID): UUID {
    return new UUID(v3(name, `${namespace}`));
  }

  static generateV4(): UUID {
    return new UUID(v4());
  }

  static generateV5(name: string, namespace: UUID): UUID {
    return new UUID(v5(name, `${namespace}`));
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
    const ver = uuidVersion(this.id);
    switch (ver) {
      case 3: {
        return Version.V3;
      }
      case 4: {
        return Version.V4;
      }
      case 5: {
        return Version.V5;
      }
      default: {
        // Includes v1 and any other versions
        return Version.V1;
      }
    }
  }
}

// Lazy nil instance getter to avoid circular dependency at module load time
let _nil: UUID | null = null;
export function getNilUUID(): UUID {
  if (!_nil) _nil = new UUID('00000000-0000-0000-0000-000000000000');
  return _nil;
}

/**
 * The Max UUID (`ffffffff-ffff-ffff-ffff-ffffffffffff`), defined by RFC 9562 section 5.10 as the
 * counterpart to the Nil UUID.
 *
 * Used as the owner of privately published content that is shared rather than public: the row says
 * "this is private shared content" while access rules say whose it is and who may read it.
 *
 * Takes the value from the `uuid` package's `MAX` constant rather than writing the literal, and is
 * lazy for the same reason as the nil instance above.
 */
let _max: UUID | null = null;
export function getMaxUUID(): UUID {
  if (!_max) _max = new UUID(MAX);
  return _max;
}
