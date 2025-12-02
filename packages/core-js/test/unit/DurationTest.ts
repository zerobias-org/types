import { expect } from 'chai';
import { Duration } from '../../src/types/Duration.js';
import { InvalidInputError } from '../../src/index.js';

describe('Duration', function () {

    it('should return a description of the class', async function () {
        const desc = Duration.description();
        expect(desc).to.be.ok;
        expect(desc).to.include('duration');
    });

    it('should return examples for the class', async function () {
        const examples = Duration.examples();
        expect(examples).to.be.ok;
    });

    it('should validate a valid ISO8601 string', async function () {
        const duration = await Duration.parse('P3Y6M4DT12H30M5S');
        expect(duration).to.be.ok;
        expect(duration instanceof Duration).to.be.true;
    });

    it('should reject an invalid ISO8601 string', async function () {
        try {
            await Duration.parse('42');
            expect.fail('Should not parse an invalid ISO8601 string');
        } catch (e) {
            expect(e instanceof InvalidInputError).to.be.true;
        }
    });

    it('should parse millis to a valid Duration', async function () {
        const d = Duration.fromMilliseconds(3000);
        expect(d.toString()).to.be.eq('PT3S');
    });

    it('should parse millis to a valid Duration with seconds and fractional seconds', async function () {
        const d = Duration.fromMilliseconds(3456);
        expect(d.toString()).to.be.eq('PT3.456S');
    });

    it('should parse millis to a valid Duration with only fractional seconds', async function () {
        const d = Duration.fromMilliseconds(456);
        expect(d.toString()).to.be.eq('PT0.456S');
    });
});
