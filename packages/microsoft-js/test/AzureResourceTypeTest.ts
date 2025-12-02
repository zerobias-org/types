import { expect } from 'chai';
import { CoreType, IllegalArgumentError, InvalidInputError } from '@zerobias-org/types-core-js';
import { AzureResourceProvider } from '../generated/model.js';
import { AzureResourceType } from '../src/index.js';

describe('AzureResourceType', function () {

  it('should be included in CoreType.listTypes', async function () {
    expect(CoreType.listTypes()).to.include('azureResourceType');
  });

  it('should return a description of the class', async function () {
    const desc = AzureResourceType.description();
    expect(desc).to.be.ok;
    expect(desc).to.include('Azure Resource Type');
  });

  it('should return examples for the class', async function () {
    const examples = AzureResourceType.examples();
    expect(examples).to.be.ok;
  });

  it('should validate a valid type', async function () {
    const type = await AzureResourceType.parse('key_vault/vaults');
    expect(type).to.be.ok;
    expect(type instanceof AzureResourceType).to.be.true;
  });

  it('should reject a type with an invalid provider string', async function () {
    try {
      await AzureResourceType.parse('InvalidProvider/vaults');
      expect.fail('Should not parse a type with an invalid provider string');
    } catch (e) {
      expect(e instanceof IllegalArgumentError).to.be.true;
    }
  });

  it('should reject a type which doesn\'t contain a slash', async function () {
    try {
      await AzureResourceType.parse('key_vault.vaults');
      expect.fail('Should not parse a type which doesn\'t contain a slash');
    } catch (e) {
      expect(e instanceof IllegalArgumentError).to.be.true;
    }
  });

  it('should correctly return provider and path for a type', async function () {
    const type = await AzureResourceType.parse('key_vault/vaults');
    expect(type.provider).to.be.eql(AzureResourceProvider.KeyVault);
    expect(type.path).to.be.equal('/vaults');
  });

  it('should correctly compare two types', async function () {
    const type1 = await AzureResourceType.parse('key_vault/vaults');
    const type2 = new AzureResourceType('key_vault/Vaults');
    const type3 = new AzureResourceType('key_vault/Vaults2');
    expect(type1.equals(type2)).to.be.true;
    expect(type1.equals(type3)).to.be.false;
    expect(type2.equals(type3)).to.be.false;
  });

});
