import { createRequire } from 'node:module';
import { CoreType, TypeLibrary } from '@zerobias-org/types-core-js';
import {
  AzureAdditionalLocations,
  AzureRegion,
  AzureResourceIdentityType,
  AzureResourceProvider,
  AzureResourceSkuTier,
  AzureVmSize,
  ObjectSerializer
} from '../generated/model.js';
import * as primitiveTypes from './types/index.js';

const require = createRequire(import.meta.url);
const microsoftTypeDefs = require('@zerobias-org/types-microsoft/data/types/types.json');

export class MicrosoftType {
  private static initialized = false;

  static get(typeName: string): CoreType {
    MicrosoftType.init();
    return CoreType.get(typeName);
  }

  static init(): void {
    if (MicrosoftType.initialized) {
      return;
    }
    CoreType.loadTypeLibrary(
      new TypeLibrary(
        '@zerobias-org/types-microsoft',
        microsoftTypeDefs,
        primitiveTypes,
        {
          azureAdditionalLocations: AzureAdditionalLocations,
          azureResourceIdentityType: AzureResourceIdentityType,
          azureResourceSkuTier: AzureResourceSkuTier,
          azureResourceProvider: AzureResourceProvider,
          azureVmSize: AzureVmSize,
          azureCloudRegion: AzureRegion,
        },
        ObjectSerializer.deserialize,
        (name: string) => {
          if (name.toLowerCase() === 'azurecloudregion') {
            return ObjectSerializer.getSchema('AzureRegion');
          }
          return ObjectSerializer.getSchema(name);
        }
      )
    );
    MicrosoftType.initialized = true;
  }
}
