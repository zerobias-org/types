import { CoreType, TypeLibrary } from '@zerobias-org/types-core-js';
import {
  AwsAccessPolicyStatementEffect,
  AwsAccessPolicyStatementOperator,
  AwsAccessPolicyStatementResource,
  AwsPartition,
  AwsRegion,
  AwsService,
  ObjectSerializer
} from '../generated/model/index.js';
import * as primitiveTypes from './types/index.js';
import amazonTypeDefs from '@zerobias-org/types-amazon/data/types/types.json' with { type: 'json' };

export class AmazonType {
  private static initialized = false;

  static get(typeName: string): CoreType {
    AmazonType.init();
    return CoreType.get(typeName);
  }

  static init(): void {
    if (AmazonType.initialized) {
      return;
    }
    CoreType.loadTypeLibrary(
      new TypeLibrary(
        '@zerobias-org/types-amazon',
        amazonTypeDefs,
        primitiveTypes,
        {
          awsAccessPolicyStatementResource: AwsAccessPolicyStatementResource,
          awsAccessPolicyStatementOperator: AwsAccessPolicyStatementOperator,
          awsAccessPolicyStatementEffect: AwsAccessPolicyStatementEffect,
          awsPartition: AwsPartition,
          awsCloudRegion: AwsRegion,
          awsService: AwsService,
        },
        ObjectSerializer.deserialize,
        (name: string) => {
          if (name.toLowerCase() === 'awscloudregion') {
            return ObjectSerializer.getSchema('AwsRegion');
          }
          return ObjectSerializer.getSchema(name);
        }
      )
    );
    AmazonType.initialized = true;
  }
}
