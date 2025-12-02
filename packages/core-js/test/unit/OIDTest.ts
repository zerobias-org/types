import { expect } from 'chai';
import { OID } from '../../src/types/OID.js';
import { IllegalArgumentError, InvalidInputError } from '../../src/index.js';

describe('OID', function () {

  it('should return a description of the OID class', async function () {
    const desc = OID.description();
    expect(desc).to.be.ok;
    expect(desc).to.include('numbering');
  });

  it('should return examples for the OID class', async function () {
    const examples = OID.examples();
    expect(examples).to.be.ok;
  });

  it('should validate a valid OID', async function () {
    const oid = await OID.parse('1.0.0.1');
    expect(oid).to.be.ok;
    expect(oid instanceof OID).to.be.true;
  });

  it('should allow int[] constructor', async function () {
    const value = [ 1, 4, 5 ];
		let oid = new OID(value);
    expect(oid.toString()).to.equal('1.4.5');
  });

  it('should allow string[] constructor', async function () {
    const value = [ '1', '4', '5' ];
		let oid = new OID(value);
    expect(oid.toString()).to.equal('1.4.5');
  });

  it('should validate a valid number OID', async function () {
    const oid = new OID(145);
    expect(oid).to.be.ok;
    expect(oid instanceof OID).to.be.true;
    expect(oid.toString()).to.equal('145');
  });

  it('should allow to/from psql', async function () {
    const oid = await OID.parse('1.2.30');
		const sql = oid.toPostgres(oid);
    expect(sql).to.equal('{1,2,30}');
    const fromSql = await OID.parse(sql);
    expect(fromSql.toString()).to.equal('1.2.30');
  });

  it('should handle all valid cases for between', async function () {
    const o1 = new OID('1.1');
    const o2 = new OID('1.3');
    const o3 = new OID('1.4');
    const o4 = new OID('2');
    const o5 = new OID('1.3.500');
    const o6 = new OID('10');
    const o7 = new OID('10000');

		const s1 = OID.between( o1, o2 );
    expect(s1.toString()).to.equal('1.2');

		const s2 = OID.between( o2, o3 );
    expect(s2.toString()).to.equal('1.3.500');

		const s3 = OID.between( o1, o4 );
    expect(s3.toString()).to.equal('1.501');

		const s4 = OID.between( o5, o3 );
    expect(s4.toString()).to.equal('1.3.1000');

		const s5 = OID.between( o4, o1 );
    expect(s5.toString()).to.equal('1.501');

    const s7 = OID.between( null, o7 );
    expect(s7.toString()).to.equal('5500');

    const s7Bis = OID.between( o7, null );
    expect(s7Bis.toString()).to.equal('11250');
    
    const s6 = OID.between( null, o6 );
    expect(s6.toString()).to.equal('8');

    const s6Bis = OID.between( o6, null );
    expect(s6Bis.toString()).to.equal('11.500');
  });

  it('should implement next', async function () {
    const o1 = new OID('1.1');
		const o2 = o1.next();
    expect(o2.toString()).to.equal('1.2');
  });

  it('should enable Array.sort', async function () {
    const o1 = new OID('1.1');
    const o2 = new OID('1.1.500');
    const o3 = new OID('1.2');
    const o4 = new OID('2');
		let list = [ o4, o2, o1, o3 ];
		list.sort( OID.compare );
    expect(list[0].toString()).to.equal('1.1');
    expect(list[1].toString()).to.equal('1.1.500');
    expect(list[2].toString()).to.equal('1.2');
    expect(list[3].toString()).to.equal('2');
  });

  it('should reject a random string', async function () {
    try {
			let oid = new OID('random data');
      expect.fail('Should not parse a random string');
    } catch (e) {
      expect(e instanceof InvalidInputError).to.be.true;
    }
  });

  it('should reject between with two nulls', async function () {
    try {
			let oid = OID.between(null, null);
      expect.fail('Should not accept two nulls in between');
    } catch (e) {
      expect(e instanceof IllegalArgumentError).to.be.true;
    }
  });
});
