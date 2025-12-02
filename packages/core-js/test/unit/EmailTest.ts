/* eslint-disable */
import { expect } from 'chai';
import { Email } from '../../src/types/Email.js';
import { CoreType, InvalidInputError, Type } from '../../src/index.js';

describe('Email', function () {

    it('should return a description of the class', async function () {
        const desc = Email.description();
        expect(desc).to.be.ok;
        expect(desc).to.include('email');
    });

    it('should return examples for the class', async function () {
        const examples = Email.examples();
        expect(examples).to.be.ok;
    });

    it('should validate a basic, valid email', async function () {
        const email = await Email.parse('test@test.com');
        expect(email).to.be.ok;
        expect(email instanceof Email).to.be.true;
    });

    it('should validate a valid email', async function () {
        const email = await Email.parse('JoeSmith.joesmith@example.com');
        expect(email).to.be.ok;
        expect(email instanceof Email).to.be.true;
    });

    it('should validate a valid email with quoted-string address', async function () {
        const email = await Email.parse(`"JohnDoe"@example.com`);
        expect(email).to.be.ok;
        expect(email instanceof Email).to.be.true;
    });

    it('should reject an email with an invalid locally interpreted string', async function () {
        try {
            await Email.parse('John..Doe@example.com');
            expect.fail('Should not parse an email with an invalid locally interpreted string');
        } catch (e) {
            expect(e instanceof InvalidInputError).to.be.true;
        }
    });

    it('should reject an email without a valid domain', async function () {
        try {
            await Email.parse('abc.def@mail#archive.com');
            expect.fail('Should not parse an email without a valid domain');
        } catch (e) {
            expect(e instanceof InvalidInputError).to.be.true;
        }
    });

    it('should reject an invalid email', async function () {
        try {
            await Email.parse('user@[IPv6:2001:db8:1ff::a0b:dbd0]');
            expect.fail('Should not parse an invalid email');
        } catch (e) {
            expect(e instanceof InvalidInputError).to.be.true;
        }
    });

    it('should have the proper HTML input type', async function () {
        const ct = CoreType.get('email');
        expect(ct.htmlInput).to.be.eq(Type.HtmlInputEnum.Email);
    });
});
