import { StringFormat, InvalidInputError, EnumValue } from '@zerobias-org/types-core-js';
import { AzureResourceProvider, AzureResourceProviderDef } from '../../generated/model.js';
import { MicrosoftType } from '../MicrosoftType.js';

/**
 * Class representing an Azure Resource Type
 */
export class AzureResourceType extends StringFormat<AzureResourceType> {
  private static coreType = MicrosoftType.get('azureResourceType');

  private resourceType: string;

  private _provider: AzureResourceProviderDef;

  private _path: string;

  constructor(resourceType: string) {
    super();
    const providerStr = resourceType.substring(0, resourceType.indexOf('/'));
    this._provider = AzureResourceType.toAzureResourceProvider(providerStr);
    if (!this.provider) {
      throw new InvalidInputError('resourceType', resourceType, AzureResourceType.examples());
    }
    this._path = resourceType.substring(resourceType.indexOf('/'));
    this.resourceType = resourceType;
  }

  static description() {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  static async parse(input: string): Promise<AzureResourceType> {
    return new AzureResourceType(input);
  }

  get provider(): AzureResourceProviderDef {
    return this._provider;
  }

  get path(): string {
    return this._path;
  }

  private static toAzureResourceProvider(input: string): EnumValue {
    let strValue;
    if (input === '84codes.CloudAMQP') {
      strValue = 'cloudamqp';
    } else {
      strValue = input.toLowerCase().replace(/\./g, '_');
    }
    return AzureResourceProvider.from(strValue);
  }

  toString(): string {
    return this.resourceType;
  }

  equals(other?: any): boolean {
    return other
      && other instanceof AzureResourceType
      && other.toString().toLowerCase() === this.resourceType.toLowerCase();
  }
}
