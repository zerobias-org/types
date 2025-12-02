import { expect } from 'chai';
import {CoreType} from '../../src/index.js';
import { UUID } from '../../src/types/index.js';

const validV1 = 'b7168568-af49-11ea-8b0b-47ecc4197a7f';
const validV3 = '9125a8dc-52ee-365b-a5aa-81b0b3681cf6';
const validV4 = '537c77d9-f318-4bbb-9468-1db4fee720df';
const validV5 = 'fdda765f-fc57-5604-a269-52a7df8164ec';

describe('UUID', function () {

  it('should return a description of the class', async function () {
    const desc = UUID.description();
    expect(desc).to.be.ok;
  });

  it('should return the examples for the class', async function () {
    const examples = UUID.examples();
    expect(examples).to.be.ok;
  });

  it('should validate a valid v1 UUID', async function () {
    const uuid = await UUID.parse(validV1);
    expect(uuid).to.be.ok;
    expect(uuid instanceof UUID).to.be.true;
  });

  it('should validate a valid v3 UUID', async function () {
    const uuid = await UUID.parse(validV3);
    expect(uuid).to.be.ok;
    expect(uuid instanceof UUID).to.be.true;
  });

  it('should validate a valid v4 UUID', async function () {
    const uuid = await UUID.parse(validV4);
    expect(uuid).to.be.ok;
    expect(uuid instanceof UUID).to.be.true;
  });

  it('should validate a valid v5 UUID', async function () {
    const uuid = await UUID.parse(validV5);
    expect(uuid).to.be.ok;
    expect(uuid instanceof UUID).to.be.true;
  });

  it('should reject a random string in the constructor', async function () {
    let fail = true;
    try {
      new UUID(Math.random().toString(36));
    } catch (e) {
      fail = false;
    }
    if (fail) {
      expect.fail();
    }
  });

  it('should reject a random string', async function () {
    let fail = true;
    try {
      await UUID.parse(Math.random().toString(36));
    } catch (e) {
      fail = false;
    }
    if (fail) {
      expect.fail();
    }
  });

  it('should generate a random v1 UUID', function () {
    const uuid = UUID.generateV1();
    expect(uuid).to.be.ok;
    expect(uuid instanceof UUID).to.be.true;
  });

  it('should generate a random v3 UUID', async function () {
    const uuid = UUID.generateV3('78842875-4007-4bee-a91e-c6fb5c06aa32', await UUID.parse('3eea1e98-87af-472c-9f7d-577e8b077871'));
    expect(uuid).to.be.ok;
    expect(uuid instanceof UUID).to.be.true;
  });

  it('should generate a random v4 UUID', function () {
    const uuid = UUID.generateV4();
    expect(uuid).to.be.ok;
    expect(uuid instanceof UUID).to.be.true;
  });

  it('should generate a random v5 UUID', async function () {
    const uuid = UUID.generateV5('1a2edac1-feb3-45ca-b9bb-cc286b76101d', await UUID.parse('9a01a049-ec4b-4a79-a7eb-7eb41a1f3295'));
    expect(uuid).to.be.ok;
    expect(uuid instanceof UUID).to.be.true;
  });

  it('should generate the same v5 UUID given the same inputs', async function () {
    const uuid1 = UUID.generateV5('Hello, world', await UUID.parse('9a01a049-ec4b-4a79-a7eb-7eb41a1f3295'));
    const uuid2 = UUID.generateV5('Hello, world', await UUID.parse('9a01a049-ec4b-4a79-a7eb-7eb41a1f3295'));
    expect(uuid1.equals(uuid2)).to.be.true;
  });

  it('should instantiate a new instance from the uuid format', async function () {
    const t = CoreType.get('uuid');
    const inst = t.newInstance(validV1);
    expect(inst).to.be.ok;
    expect(inst instanceof UUID).to.be.true;
    expect((inst as UUID).toString()).to.be.eq(validV1);
  });

});
