 
import { expect } from 'chai';
import { PhoneNumber } from '../../src/types/PhoneNumber.js';
import { CoreType, InvalidInputError, Type } from '../../src/index.js';

describe('PhoneNumber', function () {

    it('should return a description of the class', async function () {
        const desc = PhoneNumber.description();
        expect(desc).to.be.ok;
        expect(desc).to.include('phone');
    });

    it('should return examples for the class', async function () {
        const examples = PhoneNumber.examples();
        expect(examples).to.be.ok;
    });

    it('should validate a valid phone number', async function () {
        const phoneNumber = await PhoneNumber.parse('+12673103464');
        expect(phoneNumber).to.be.ok;
        expect(phoneNumber instanceof PhoneNumber).to.be.true;
    });

    it('should reject a random string', async function () {
        try {
            await PhoneNumber.parse('+407aaaaaa');
            expect.fail('Should not parse a random string');
        } catch (e) {
            expect(e instanceof InvalidInputError).to.be.true;
        }
    });

    it('should get country code ', async function () {
        const phoneNumber = new PhoneNumber('+40747676831');
        const countryCode = phoneNumber.getCountry();
        expect(countryCode).to.be.ok;
    });

    it('should have the proper HTML input type', async function () {
        const ct = CoreType.get('phoneNumber');
        expect(ct.htmlInput).to.be.eq(Type.HtmlInputEnum.Tel);
    });
});
