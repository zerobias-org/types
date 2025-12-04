 
import { expect } from 'chai';
import { DateFormat } from '../../src/types/DateFormat.js';
import { CoreType, InvalidInputError, Type } from '../../src/index.js';

const DATE = "2020-03-06";
const DATETIME = "2020-03-06T11:11:11Z";

describe('DateFormat', function () {

    it('should return a description of the class', async function () {
        const desc = DateFormat.description();
        expect(desc).to.be.ok;
        expect(desc).to.include('date');
    });

    it('should return examples for the class', async function () {
        const examples = DateFormat.examples();
        expect(examples).to.be.ok;
    });

    it('should validate a valid ISO8601 date string', async function () {
        const date = await DateFormat.parse(DATE);
        expect(date).to.be.ok;
        expect(date instanceof DateFormat).to.be.true;
        expect(date.toString()).to.be.eq(DATE);
    });

    it('should reject a valid ISO8601 date-time string', async function () {
        try {
            await DateFormat.parse(DATETIME);
            expect.fail('Should not parse a valid ISO8601 date-time string');
        } catch (e) {
            expect(e instanceof InvalidInputError).to.be.true;
        }
    });

    it('should reject an invalid ISO8601 string', async function () {
        try {
            await DateFormat.parse('42');
            expect.fail('Should not parse an invalid ISO8601 string');
        } catch (e) {
            expect(e instanceof InvalidInputError).to.be.true;
        }
    });

    it('should have the proper HTML input type', async function () {
        const ct = CoreType.get('date');
        expect(ct.htmlInput).to.be.eq(Type.HtmlInputEnum.Date);
    });
});
