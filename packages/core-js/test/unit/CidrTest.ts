import { expect } from 'chai';
import { Cidr } from '../../src/types/Cidr.js';
import { InvalidInputError } from '../../src/index.js';

describe('Classless Inter-Domain Routing', function () {

    it('should return a description of the class', async function () {
        const desc = Cidr.description();
        expect(desc).to.be.ok;
        expect(desc).to.include('CIDR');
    });

    it('should return examples for the class', async function () {
        const examples = Cidr.examples();
        expect(examples).to.be.ok;
    });

    it('should validate a valid IPv4 cidr', async function () {
        const cidr = new Cidr('10.244.10.0/16');
        expect(cidr).to.be.ok;
    });

    it('should validate a valid IPv6 cidr', async function () {
        const ip = new Cidr('2001:4860:4860::8888/32');
        expect(ip).to.be.ok;
    });

    it('should throw InvalidInputError for a random string', async function () {
        try {
            await Cidr.parse(Math.random().toString(36));
            expect.fail('Should not parse a random string');
        } catch (e) {
            expect(e instanceof InvalidInputError).to.be.true;
        }
    });

    it('should throw InvalidInputError for a subnet that was not provided', async function () {
        try {
            new Cidr('10.244.10.0');
            expect.fail('Should fail because the subnet information was not provided');
        } catch (e) {
            expect(e instanceof InvalidInputError).to.be.true;
        }
    });

    it('should return the start address for IPv4 cidr', async function () {
        const cidr = new Cidr('10.244.10.0/16').startAddress();
        expect(cidr).to.be.ok;
        expect(cidr).to.equals('10.244.0.0');
    });

    it('should return the start address for IPv6 cidr', async function () {
        const ip = new Cidr('2001:4860:4860::8888/32').startAddress();
        expect(ip).to.be.ok;
        expect(ip).to.equals('2001:4860:0000:0000:0000:0000:0000:0000');
    });

    it('should return the end address for IPv4 cidr', async function () {
        const cidr = new Cidr('10.244.10.0/16').endAddress();
        expect(cidr).to.be.ok;
        expect(cidr).to.equals('10.244.255.255');
    });

    it('should return the end address for IPv6 cidr', async function () {
        const ip = new Cidr('2001:4860:4860::8888/32').endAddress();
        expect(ip).to.be.ok;
        expect(ip).to.equals('2001:4860:ffff:ffff:ffff:ffff:ffff:ffff');
    });

    it('should return the subnet for IPv4 cidr', async function () {
        const cidr = new Cidr('10.244.10.0/16').subnet();
        expect(cidr).to.be.ok;
        expect(cidr).to.equals('/16');
    });

    it('should return the subnet for IPv6 cidr', async function () {
        const ip = new Cidr('2001:db8::/32').subnet();
        expect(ip).to.be.ok;
        expect(ip).to.equals('/32');
    });

    it('should return mask for IPv4 cidr', async function () {
        const cidr = new Cidr('10.244.10.0/16').mask();
        expect(cidr).to.be.ok;
        expect(cidr).to.equals('0000101011110100');
    });

    it('should return the mask for IPv6 cidr', async function () {
        const ip = new Cidr('2001:4860:4860::8888/32').mask();
        expect(ip).to.be.ok;
        expect(ip).to.equals('00100000000000010100100001100000');
    });

    it('should return true for an ip address that is in the subnet', async function () {
        const cidr = new Cidr('10.244.10.0/16').isInSubnet('10.244.0.0/16');
        expect(cidr).to.be.ok;
        expect(cidr).to.be.true;
    });
});
