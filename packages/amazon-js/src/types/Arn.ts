import {
  CloudRegion,
  CloudRegionDef,
  EnumValue,
  IllegalArgumentError,
  InvalidInputError,
  StringFormat
} from '@zerobias-org/types-core-js';
import {
  AwsPartition,
  AwsPartitionDef,
  AwsRegion,
  AwsRegionDef,
  AwsService,
  AwsServiceDef
} from '../../generated/model/index.js';
import { AmazonType } from '../AmazonType.js';

const prefixRegex = /^arn$/;
const partitionRegex = /^(?<partition>aws|aws-cn|aws-us-gov|.*[*?].*)$/;
// eslint-disable-next-line
const variableRegex = '(?:\\${[^}]+})';
const baseElementRegex = `(?:[\\w+=\\/,.@\\-*?]+|${variableRegex})`;
const serviceRegex = new RegExp(`(?<service>${baseElementRegex}+)`);
const regionRegex = new RegExp(`(?<region>${baseElementRegex}*)`);
const accountRegex = new RegExp(`^(?<account>(?:[0-9*?]+|${variableRegex})*|aws)$`);
const resourceTypeRegex = /^((?<resourceType>[\w-_]*)[:/]{1}){0,1}(?<resourceId>.*)$/;

// That regex is too complicated and seems to be hanging against specific inputs
// (containing spaces or [])
// While worth investigating and simplify the regexp as a whole, the resource-id
// doesn't seem predictable at all.
//
// const resourceIdRegex = `((?:[\\w/+=:,.@\\-*?]+|${variableRegex})+)`;

/**
 * Checks whether the given string includes variables. i.e. ${aws:username}
 * @param str
 * @returns
 */
function hasVariables(str: string): boolean {
  // eslint-disable-next-line
  const re = /\$\{([^\}]+)\}/;
  return re.test(str);
}

/**
 * Given a potential arn with wildcards, tests the given arn for a match
 * @param patternArn
 * @param arn
 * @returns
 */
function testPatternArn(patternArn: string, arn: string) {
  const w = patternArn.replace(/[.+^${}()|[\]\\]/g, '\\$&'); // regexp escape
  const re = new RegExp(`^${w.replace(/\*/g, '.*').replace(/\?/g, '.')}$`, 'i');
  return re.test(arn);
}

type ArnParts = {
  partition: string;
  account?: string;
  region?: string;
  service: string;
  resourceType?: string;
  resourceId: string;
};

function splitArn(arn: string): ArnParts {
  const escapedVariablesArn = arn.replace(/(\${[^}]*):([^{]*})/g, '$1_colon_$2');

  const arnParts = escapedVariablesArn
    .split(':')
    .map((part) => part.replace(/_colon_/g, ':'));
  if (arnParts.length < 6) {
    throw new InvalidInputError('Arn', arn);
  }

  const prefixPart = arnParts[0];
  const partitionPart = arnParts[1];
  const servicePart = arnParts[2];
  const regionPart = arnParts[3];
  const accountPart = arnParts[4];
  const resourcePart = arnParts.slice(5).join(':');

  const prefixMatch = prefixRegex.test(prefixPart);
  const partitionMatch = partitionPart.match(partitionRegex);
  const serviceMatch = servicePart.match(serviceRegex);
  const regionMatch = regionPart.match(regionRegex);
  const accountMatch = accountPart.match(accountRegex);
  const resourceMatch = resourcePart.match(resourceTypeRegex);

  if (!prefixMatch
    || !partitionMatch
    || !serviceMatch
    || !regionMatch
    || !accountMatch
    || !resourceMatch) {
    throw new InvalidInputError('Arn', arn);
  }

  const partition = partitionMatch.groups?.partition;
  const service = serviceMatch.groups?.service;
  const region = regionMatch.groups?.region;
  const account = accountMatch.groups?.account;
  const resourceType = resourceMatch.groups?.resourceType;
  const resourceId = resourceMatch.groups?.resourceId;

  if (!partition
    || !service
    || !resourceId) {
    throw new InvalidInputError('Arn', arn);
  }

  return {
    partition,
    account,
    region,
    service,
    resourceType,
    resourceId,
  };
}

/**
 * Class representing an Amazon Resoucre Name
 */
export class Arn extends StringFormat<Arn> {
  private static coreType = AmazonType.get('arn');

  private arn: string;

  private _partition: AwsPartitionDef | string;

  private _service: AwsServiceDef | string;

  private _cloudRegion?: CloudRegionDef | string;

  private _region?: AwsRegionDef | string;

  private _accountId?: string;

  private _resourceId: string;

  private _resourceType?: string;

  private static isValueUnknown<EnumType>(input?: string | EnumType): boolean {
    return typeof input === 'string' && !Arn.hasWildcards(input);
  }

  private static hasWildcards(input: string): boolean {
    return input.includes('*')
      || input.includes('?')
      || input.includes('$');
  }

  private static mapElement(
    _enum: { from: (input: string | number) => EnumValue; },
    value?: string
  ): EnumValue | string {
    if (!value) {
      throw new InvalidInputError('arn element', 'undefined');
    }
    try {
      const enumValue = value ? _enum.from(value) : undefined;
      if (enumValue) {
        return enumValue;
      }
    } catch (err) {
      if (!(err instanceof IllegalArgumentError) || !(err.message.includes('is not a valid'))) {
        throw err;
      }
    }
    return value;
  }

  constructor(arn: string) {
    super();

    let arnParts: ArnParts;

    try {
      arnParts = splitArn(arn);
    } catch (err) {
      throw new InvalidInputError('Arn', arn, Arn.examples());
    }

    this._partition = Arn.mapElement(AwsPartition, arnParts.partition.replace(/-/g, '_'));
    this._service = Arn.mapElement(AwsService, arnParts.service.replace(/-/g, '_'));
    this._region = arnParts.region
      ? Arn.mapElement(AwsRegion, arnParts.region)
      : undefined;
    this._cloudRegion = arnParts.region
      ? Arn.mapElement(CloudRegion, `aws_${arnParts.region.replace(/-/g, '_')}`)
      : undefined;
    this._accountId = arnParts.account || undefined;
    this._resourceType = arnParts.resourceType || undefined;
    this._resourceId = arnParts.resourceId;

    this.arn = arn;
  }

  static description(): string {
    return this.coreType.description;
  }

  static examples(): Array<string> {
    return this.coreType.examples.map((example) => example.toString());
  }

  static async parse(input: string): Promise<Arn> {
    return new Arn(input);
  }

  toString(): string {
    return this.arn;
  }

  // eslint-disable-next-line
  equals(other?: any): boolean {
    return other && other instanceof Arn && other.toString() === this.arn;
  }

  matches(value: any): boolean {
    if (!value) {
      return false;
    }
    const otherArn = value.toString();
    if (hasVariables(this.arn) || hasVariables(otherArn)) {
      // unable to match arns that contain variables for now.
      // ${aws.username} in a policy for instance, should be substituted before hand
      return false;
    }
    return testPatternArn(otherArn, this.arn)
      || testPatternArn(this.arn, otherArn);
  }

  get partition(): AwsPartitionDef | string {
    return this._partition;
  }

  get service(): AwsServiceDef | string {
    return this._service;
  }

  get isServiceUnknown(): boolean {
    return Arn.isValueUnknown(this._service);
  }

  get region(): AwsRegionDef | string | undefined {
    return this._region;
  }

  get isRegionUnknown(): boolean {
    return Arn.isValueUnknown(this._region);
  }

  get cloudRegion(): CloudRegionDef | string | undefined {
    return this._cloudRegion;
  }

  get isCloudRegionUnknown(): boolean {
    return Arn.isValueUnknown(this._cloudRegion);
  }

  get accountId(): string | undefined {
    return this._accountId;
  }

  get resourceType(): string | undefined {
    return this._resourceType;
  }

  get resourceId(): string {
    return this._resourceId;
  }
}
