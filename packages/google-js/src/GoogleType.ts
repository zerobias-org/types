import { CoreType, TypeLibrary } from '@zerobias-org/types-core-js';
import {
  ObjectSerializer,
  GcpAccessPolicyAuditLogConfigType,
  GcpAccessPolicyVersion
} from '../generated/model/index.js';
import * as primitiveTypes from './types/index.js';
import googleTypeDefs from '@zerobias-org/types-google/data/types/types.json' with { type: 'json' };

export class GoogleType {
  private static initialized = false;

  static get(typeName: string): CoreType {
    GoogleType.init();
    return CoreType.get(typeName);
  }

  static init(): void {
    if (GoogleType.initialized) {
      return;
    }
    CoreType.loadTypeLibrary(
      new TypeLibrary(
        '@zerobias-org/types-google',
        googleTypeDefs,
        primitiveTypes,
        {
          gcpAccessPolicyAuditLogConfigType: GcpAccessPolicyAuditLogConfigType,
          gcpAccessPolicyVersion: GcpAccessPolicyVersion,
        },
        ObjectSerializer.deserialize,
        ObjectSerializer.getSchema
      )
    );
    GoogleType.initialized = true;
  }
}
