import { createRequire } from 'node:module';
import { TypeLibrary } from './TypeLibrary.js';
import {
  ChangeOperation,
  CloudMarket,
  CloudProvider,
  CloudRegion,
  GeoSubdivision,
  EnvType,
  GeoCountry,
  HttpMethod,
  Language,
  Locale,
  ObjectSerializer,
  OpenApiMethod,
  TimeZone,
  TimeZoneType,
  AsymmetricKey,
  CipherSuite,
  TlsProtocol,
  SignatureAlgorithm,
  CloudAvailabilityZone,
  SortDirection,
  Severity,
  DayOfWeek,
  Month
} from '../generated/model/index.js';
import * as primitiveTypes from './types/index.js';

const require = createRequire(import.meta.url);
const coreTypeDefs = require('@zerobias-org/types-core/data/types/types.json');

/* eslint-disable max-len */
const CHANGE_EVENT_SCHEMA = 'ewogICJyZXF1aXJlZCIgOiBbICJvcCIsICJ0aW1lc3RhbXAiIF0sCiAgInR5cGUiIDogIm9iamVjdCIsCiAgInByb3BlcnRpZXMiIDogewogICAgIm9wIiA6IHsKICAgICAgIiRyZWYiIDogIiMvY29tcG9uZW50cy9zY2hlbWFzL0NoYW5nZU9wZXJhdGlvbiIKICAgIH0sCiAgICAidGltZXN0YW1wIiA6IHsKICAgICAgInR5cGUiIDogInN0cmluZyIsCiAgICAgICJkZXNjcmlwdGlvbiIgOiAiVGhlIHRpbWUgd2hlbiB0aGlzIGNoYW5nZSBvY2N1cnJlZC4iLAogICAgICAiZm9ybWF0IiA6ICJkYXRlLXRpbWUiCiAgICB9LAogICAgImFjdG9yIiA6IHsKICAgICAgInR5cGUiIDogInN0cmluZyIsCiAgICAgICJkZXNjcmlwdGlvbiIgOiAiQW4gb3BhcXVlIHN0cmluZyBmb3IgZGVzY3JpYmluZyB0aGUgYWN0b3Igd2hvIGNhdXNlZCB0aGlzIGV2ZW50LiBTdXBwb3J0IGZvciB0aGlzIGZpZWxkIGlzIHVwIHRvIHRoZSBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBhcyBpcyBpdHMgZm9ybWF0IGFuZCBtZWFuaW5nLiIKICAgIH0sCiAgICAiYmVmb3JlIiA6IHsKICAgICAgInR5cGUiIDogIm9iamVjdCIsCiAgICAgICJkZXNjcmlwdGlvbiIgOiAiVGhlIG9iamVjdCdzIHN0YXRlIGJlZm9yZSB0aGUgY2hhbmdlIGV2ZW50LiBUaGlzIGNhbiBvbmx5IGJlIHByZXNlbnQgb24gYHVwZGF0ZWAgYW5kIGBkZWxldGVgIGJ1dCBtYXkgYmUgIGFic2VudCBldmVuIG9uIHRob3NlIGV2ZW50cywgZGVwZW5kaW5nIG9uIHRoZSBpbXBsZW1lbnRhdGlvbi4iCiAgICB9LAogICAgImFmdGVyIiA6IHsKICAgICAgInR5cGUiIDogIm9iamVjdCIsCiAgICAgICJkZXNjcmlwdGlvbiIgOiAiVGhlIG9iamVjdCdzIHN0YXRlIGFmdGVyIHRoZSBjaGFuZ2UgZXZlbnQuIFRoaXMgd2lsbCBvbmx5IGJlIHByZXNlbnQgb24gYGNyZWF0ZWAgYW5kIGB1cGRhdGVgLiIKICAgIH0KICB9LAogICJkZXNjcmlwdGlvbiIgOiAiR2VuZXJpYyBldmVudCBmb3IgaGFuZGxpbmcgZGF0YSBjaGFuZ2VzIgp9';

export class CoreTypeLibrary extends TypeLibrary {
  constructor() {
    super(
      '@zerobias-org/types-core',
      coreTypeDefs,
      primitiveTypes,
      {
        cloudAvailabilityZone: CloudAvailabilityZone,
        cloudMarket: CloudMarket,
        cloudProvider: CloudProvider,
        cloudRegion: CloudRegion,
        envType: EnvType,
        geoCountry: GeoCountry,
        geoSubdivision: GeoSubdivision,
        language: Language,
        locale: Locale,
        asymmetricKey: AsymmetricKey,
        cipherSuite: CipherSuite,
        tlsProtocol: TlsProtocol,
        signatureAlgorithm: SignatureAlgorithm,
        timeZone: TimeZone,
        timeZoneType: TimeZoneType,
        httpMethod: HttpMethod,
        openApiMethod: OpenApiMethod,
        changeOperation: ChangeOperation,
        sortDirection: SortDirection,
        severity: Severity,
        dayOfWeek: DayOfWeek,
        month: Month,
      },
      ObjectSerializer.deserialize,
      (name: string) => {
        if (name === 'ChangeEvent') {
          return CHANGE_EVENT_SCHEMA;
        }
        return ObjectSerializer.getSchema(name);
      }
    );
  }

  override newInstance(type: string, args: any) {
    switch (type) {
      case 'date-time': { return super.newInstance('DateTime', args);
      }
      case 'date': { return super.newInstance('DateFormat', args);
      }
      case 'number': { return super.newInstance('Double', args);
      }
      case 'url': { return super.newInstance('URL', args);
      }
      case 'uuid': { return super.newInstance('UUID', args);
      }
      case 'oid': { return super.newInstance('OID', args);
      }
      default: { return super.newInstance(type, args);
      }
    }
  }
}
