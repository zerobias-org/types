import { InvalidInputError, StringFormat } from '@zerobias-org/types-core-js';
import { AmazonType } from '../AmazonType.js';

const pattern = /^(?<digest>sha256:[A-Fa-f0-9]{64})(:(?!$))?(?<tag>[a-zA-Z0-9.-]{1,300})?$/;

/**
 * Class representing an AWS ECR Image Id
 */

export class AwsImageId extends StringFormat<AwsImageId> {
  private static coreType = AmazonType.get('awsImageId');

  private awsImageId: string;

  private _digest: string;

  private _tag: string;

  constructor(awsImageId: string) {
    super();

    const parsedAwsImageId = awsImageId.match(pattern);
    if (!parsedAwsImageId?.groups?.digest) {
      throw new InvalidInputError('awsImageId', awsImageId, AwsImageId.examples());
    }

    (
      { digest: this._digest, tag: this._tag } = parsedAwsImageId.groups
    );

    this.awsImageId = awsImageId;
  }

  static description(): string {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  static async parse(input: string): Promise<AwsImageId> {
    return new AwsImageId(input);
  }

  toString(): string {
    return this.awsImageId;
  }

  // eslint-disable-next-line
  equals(other?: any): boolean {
    return (
      other
      && other instanceof AwsImageId
      && other.toString() === this.toString()
    );
  }

  get digest(): string {
    return this._digest;
  }

  get tag(): string | undefined {
    return this._tag;
  }
}
