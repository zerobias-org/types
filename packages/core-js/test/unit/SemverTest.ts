import { expect } from 'chai';
import { Semver } from '../../src/types/Semver.js';
import { InvalidInputError } from '../../src/index.js';

describe('Semver', function () {

    it('should return a description of the class', async function () {
        const desc = Semver.description();
        expect(desc).to.be.ok;
        expect(desc).to.include('Semantic Version');
    });

    it('should return examples for the class', async function () {
        const examples = Semver.examples();
        expect(examples).to.be.ok;
    });

    it('should validate all semantic versions examples', async function () {
        Semver.examples().forEach(async semver => {
            const response = await Semver.parse(semver.toString());
            expect(response).to.be.ok;
        })
    });

    it('should fail for an invalid semantic version', async function () {
        try {
            await Semver.parse('1.0-SNAPSHOT');
            expect.fail('Should not parse an invalid semantic version');
        } catch (err) {
            expect(err).to.be.instanceOf(InvalidInputError);
        }
    });

    it('should return true for semantic versions that are equal', async function () {
        const semver = new Semver('1.0.0-alpha');
        const equals = semver.equals('1.0.0-alpha');
        expect(equals).to.be.ok;
        expect(equals).to.be.true;
    });

    it('should return the semantic version as string', async function () {
        const semver = new Semver('1.0.0-alpha').toString();
        expect(semver).to.be.ok;
        expect(semver).to.be.a('string');
    });

    it('should get the major version', async function () {
        const major = new Semver('1.2.3').major;
        expect(major).to.be.ok;
        expect(major).to.equal(1);
    });

    it('should get the minor version', async function () {
        const minor = new Semver('1.2.3').minor;
        expect(minor).to.be.ok;
        expect(minor).to.equal(2);
    });

    it('should get the patch version', async function () {
        const patch = new Semver('1.2.3').patch
        expect(patch).to.be.ok;
        expect(patch).to.equal(3);
    });

    it('should return true for a higher version', async function () {
        const result = new Semver('1.2.3').gt('1.2.2');
        expect(result).to.equal(true);
    });

    it('should return false for a lower and equal versions', async function () {
        const resultLower = new Semver('1.2.3').gt('2.0.0');
        const resultEqual = new Semver('1.2.3').gt('1.2.3');
        expect(resultLower).to.equal(false);
        expect(resultEqual).to.equal(false);
    });

    it('should return true for a lower version', async function () {
        const result = new Semver('1.2.3').lt('1.2.4');
        expect(result).to.equal(true);
    });

    it('should return false for a higher and equal versions', async function () {
        const resultHigher = new Semver('2.1.0').lt('2.0.0');
        const resultEqual = new Semver('1.2.3').lt('1.2.3');
        expect(resultHigher).to.equal(false);
        expect(resultEqual).to.equal(false);
    });

    it('should return true for a higher and equal versions and false for a lower version', async function () {
        const resultHigher = new Semver('2.1.0').gte('2.0.0');
        const resultEqual = new Semver('1.2.3').gte('1.2.3');
        const resultLower = new Semver('1.2.2').gte('1.2.3');
        expect(resultHigher).to.equal(true);
        expect(resultEqual).to.equal(true);
        expect(resultLower).to.equal(false);
    });

    it('should return true for a lower and equal versions and false for a higher version', async function () {
        const resultHigher = new Semver('2.1.0').lte('2.0.0');
        const resultEqual = new Semver('1.2.3').lte('1.2.3');
        const resultLower = new Semver('1.2.2').lte('1.2.3');
        expect(resultHigher).to.equal(false);
        expect(resultEqual).to.equal(true);
        expect(resultLower).to.equal(true);
    });

    it('should return true for a higher and lower versions and false for an equal version', async function () {
        const resultHigher = new Semver('2.1.0').neq('2.0.0');
        const resultEqual = new Semver('1.2.3').neq('1.2.3');
        const resultLower = new Semver('1.2.2').neq('1.2.3');
        expect(resultHigher).to.equal(true);
        expect(resultEqual).to.equal(false);
        expect(resultLower).to.equal(true);
    });

    it('should return a valid semver', async function () {
        const semver2 = await Semver.parse('v1.20.8-gke.900')
        expect(semver2.toString()).to.equal('1.20.8-gke.900')
    })
});
