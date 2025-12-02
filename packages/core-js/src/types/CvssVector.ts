import { CvssScore, parseCvssVector } from 'vuln-vects';
import { CoreType } from '../CoreType.js';
import { StringFormat } from './StringFormat.js';
import { InvalidInputError } from '../errors/index.js';
import { Severity, SeverityDef } from '../index.js';

export class CvssVector extends StringFormat<CvssVector> {
  private static coreType = CoreType.get('cvssVector');

  private cvss: string;

  private score: CvssScore;

  constructor(input: string) {
    super();
    try {
      this.score = parseCvssVector(input);
      this.cvss = input;
    } catch (e) {
      throw new InvalidInputError('cvssVector', input, CvssVector.coreType.examples);
    }
  }

  toString(): string {
    return this.cvss;
  }

  equals(other?: any): boolean {
    return other && other instanceof CvssVector && other.cvss === this.cvss;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  static description() {
    return this.coreType.description;
  }

  static async parse(input: string): Promise<CvssVector> {
    return new CvssVector(input);
  }

  get severity(): SeverityDef {
    const s = this.score.cvss3OverallSeverityText;
    return Severity.from(s.charAt(0).toUpperCase() + s.slice(1));
  }

  get baseScore(): number {
    return this.score.baseScore;
  }
}
