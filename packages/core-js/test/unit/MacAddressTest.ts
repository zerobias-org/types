import { expect } from 'chai';
import { MacAddress } from '../../src/types/index.js';
import { InvalidInputError } from '../../src/index.js';

describe('MacAddress', function () {

    it('should return a description of the class', async function () {
        const desc = MacAddress.description();
        expect(desc).to.be.ok;
        expect(desc).to.include('MAC');
    });

    it('should return examples for the class', async function () {
        const examples = MacAddress.examples();
        expect(examples).to.be.ok;
    });

    it('should validate a valid MAC address with lowercase, colons', async function () {
        const token = await MacAddress.parse('62:6d:76:cf:d9:75');
        expect(token).to.be.ok;
        expect(token instanceof MacAddress).to.be.true;
    });

    it('should validate a valid MAC address with uppercase, colons', async function () {
        const token = await MacAddress.parse('62:6D:76:CF:D9:75');
        expect(token).to.be.ok;
        expect(token instanceof MacAddress).to.be.true;
    });

    it('should validate a valid MAC address with lowercase, hyphens', async function () {
        const token = await MacAddress.parse('62-6d-76-cf-d9-75');
        expect(token).to.be.ok;
        expect(token instanceof MacAddress).to.be.true;
    });

    it('should validate a valid MAC address with uppercase, hyphens', async function () {
        const token = await MacAddress.parse('62-6D-76-CF-D9-75');
        expect(token).to.be.ok;
        expect(token instanceof MacAddress).to.be.true;
    });

    it('should reject an invalid MAC address', async function () {
        try {
            await MacAddress.parse('aoeu$');
            expect.fail('Should not parse a MAC address containing invalid characters');
        } catch (e) {
            expect(e instanceof InvalidInputError).to.be.true;
        }
    });

    it('should generate a random MAC address', async function () {
        const mac = MacAddress.random();
        expect(mac).to.be.ok;
        expect(mac instanceof MacAddress).to.be.true;
    });

    it('should properly test equality', async function () {
        const mac = MacAddress.random();
        const mac2 = new MacAddress(mac.toString());
        expect(mac.equals(mac2)).to.be.true;
    });

    it('should properly test inequality', async function () {
        const mac = MacAddress.random();
        const mac2 = MacAddress.random();
        expect(mac.equals(mac2)).to.be.false;
    });
});
