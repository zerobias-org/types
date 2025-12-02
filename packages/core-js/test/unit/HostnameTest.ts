import { expect } from 'chai';
import { Hostname } from '../../src/types/Hostname.js';
import { InvalidInputError } from '../../src/index.js';

describe('Hostname', function () {

    it('should return a description of the class', async function () {
        const desc = Hostname.description();
        expect(desc).to.be.ok;
        expect(desc).to.include('hostname');
    });

    it('should return examples for the class', async function () {
        const examples = Hostname.examples();
        expect(examples).to.be.ok;
    });

    it('should validate a valid FQDN', async function () {
        const hostname = await Hostname.parse('www.google.com');
        expect(hostname).to.be.ok;
        expect(hostname instanceof Hostname).to.be.true;
    });

    it('should validate a valid FQDN with trailing dot', async function () {
        const hostname = await Hostname.parse('www.google.com.');
        expect(hostname).to.be.ok;
        expect(hostname instanceof Hostname).to.be.true;
    });

    it('should validate a valid short hostname', async function () {
        const hostname = await Hostname.parse('google');
        expect(hostname).to.be.ok;
        expect(hostname instanceof Hostname).to.be.true;
    });

    it('should reject a hostname starting with a hyphen', async function () {
        try {
            await Hostname.parse('-a.com');
            expect.fail('Should not parse an hostname starting with a hyphen');
        } catch (e) {
            expect(e instanceof InvalidInputError).to.be.true;
        }
    });

    it('should validate a hostname starting with a numeral', async function () {
        const hostname = await Hostname.parse('0a.com');
        expect(hostname).to.be.ok;
        expect(hostname instanceof Hostname).to.be.true;
    });

    it('should validate a hostname that all numerals', async function () {
        const hostname = await Hostname.parse('00000.com');
        expect(hostname).to.be.ok;
        expect(hostname instanceof Hostname).to.be.true;
    });
});
