 
import { expect } from 'chai';
import { DateTime } from '../../src/types/DateTime.js';
import { InvalidInputError, CoreType, Type } from '../../src/index.js';

const DATE = "2020-03-06";
const DATETIME = "2020-03-06T11:11:11.000Z";
const DATETIME_WITHOUT_SECFRAC = "2020-03-06T11:11:11Z";
const INVALID_DATETIME = "2020-03-06T11:11:11.Z";

describe('DateTime', function () {

    it('should return a description of the class', async function () {
        const desc = DateTime.description();
        expect(desc).to.be.ok;
        expect(desc).to.include('ts');
    });

    it('should return examples for the class', async function () {
        const examples = DateTime.examples();
        expect(examples).to.be.ok;
    });

    it('should validate a valid ISO8601 date-time string', async function () {
        const ts = await DateTime.parse(DATETIME);
        expect(ts).to.be.ok;
        expect(ts instanceof DateTime).to.be.true;
        expect(ts.toString()).to.be.eq(DATETIME);
    });

    it('should validate a valid ISO8601 date-time string without fractional seconds', async function () {
        const ts = await DateTime.parse(DATETIME_WITHOUT_SECFRAC);
        expect(ts).to.be.ok;
        expect(ts instanceof DateTime).to.be.true;
        expect(ts.toString()).to.be.eq(DATETIME);
    });

    it('should reject a valid ISO8601 full-date string', async function () {
        try {
            await DateTime.parse(DATE);
            expect.fail('Should not parse a valid ISO8601 ts-time string');
        } catch (e) {
            expect(e instanceof InvalidInputError).to.be.true;
        }
    });

    it('should reject an invalid ISO8601 string', async function () {
        try {
            await DateTime.parse('42');
            expect.fail('Should not parse an invalid ISO8601 string');
        } catch (e) {
            expect(e instanceof InvalidInputError).to.be.true;
        }
    });

    it('should reject an invalid ISO8601 string w/o fractional seconds', async function () {
        try {
            await DateTime.parse(INVALID_DATETIME);
            expect.fail('Should not parse an invalid ISO8601 string');
        } catch (e) {
            expect(e instanceof InvalidInputError).to.be.true;
        }
    });

    it('should instantiate a new instance from the date-time format', async function () {
        const t = CoreType.get('date-time');
        const inst = t.newInstance(DATETIME);
        expect(inst).to.be.ok;
        expect(inst instanceof DateTime).to.be.true;
        expect((inst as DateTime).toString()).to.be.eq(DATETIME);
    });

    it('should have the proper HTML input type', async function () {
        const ct = CoreType.get('date-time');
        expect(ct.htmlInput).to.be.eq(Type.HtmlInputEnum.DatetimeLocal);
    });
});
