export { EnumValue } from './EnumValue.js';
export { CoreType } from './CoreType.js';
export { TypeLibrary } from './TypeLibrary.js';
export {
  PagedResults,
  PagedResultsColumnOptionsDef,
  PagedResultsColumnOptionsFilterDef,
  PagedResultsColumnOptionsFilterType,
  PagedResultsSearchColumnOptionsDef,
  PaginationMode
} from './PagedResults.js';
export { PropertySelector } from './PropertySelector.js';
export {
  BasicConnection,
  ChangeOperation,
  ChangeOperationDef,
  ConnectionMetadata,
  ConnectionStatus,
  ConnectionStatusDef,
  CloudMarket,
  CloudMarketDef,
  CloudMarketInfo,
  CloudProvider,
  CloudProviderDef,
  CloudRegion,
  CloudRegionDef,
  CloudRegionInfo,
  EnvType,
  EnvTypeDef,
  GeoCountry,
  GeoCountryDef,
  GeoCountryInfo,
  GeoPoint,
  GeoSubdivision,
  GeoSubdivisionDef,
  HttpMethod,
  HttpMethodDef,
  HubConnectionProfile,
  Language,
  LanguageDef,
  LanguageInfo,
  Locale as LanguageLocale,
  LocaleDef as LanguageLocaleDef,
  OauthClientProfile,
  OauthConnectionDetails,
  OauthTokenProfile,
  OauthTokenState,
  ObjectSerializer,
  OpenApiMethod,
  OpenApiMethodDef,
  OperationSupportStatus,
  OperationSupportStatusDef,
  SdkConnectionProfile,
  Severity,
  SeverityDef,
  SortDirection,
  SortDirectionDef,
  Tag,
  TimeZone,
  TimeZoneDef,
  AsymmetricKey as TlsAsymmetricKey,
  AsymmetricKeyDef as TlsAsymmetricKeyDef,
  AsymmetricKeyInfo as TlsAsymmetricKeyInfo,
  CipherSuite as TlsCipherSuite,
  CipherSuiteDef as TlsCipherSuiteDef,
  CipherSuiteInfo as TlsCipherSuiteInfo,
  TlsProtocol,
  TlsProtocolDef,
  SignatureAlgorithm as TlsSignatureAlgorithm,
  SignatureAlgorithmDef as TlsSignatureAlgorithmDef,
  X509Certificate as TlsX509Certificate,
  X509Subject as TlsX509Subject,
  TokenConnectionState,
  ConnectionState,
  TokenProfile,
  Type,
  EventKind,
  EventKindDef,
  Event as EventModel,
  ChangeEvent as ChangeEventModel,
  CronEvent as CronEventModel,
  DayOfWeek,
  Month,
  CronExpression
} from '../generated/model/index.js';
export * from './errors/index.js';
export * from './types/index.js';
export * from './Event.js';
export * from './ChangeEvent.js';
export * from './CronEvent.js';
export * from './Cron.js';

// Initialize the CoreError library after all modules are loaded
// This breaks the circular dependency by ensuring CoreErrorLibrary
// is only imported after all error classes are defined
import { CoreError } from './errors/CoreError.js';
import { CoreErrorLibrary } from './errors/CoreErrorLibrary.js';
CoreError.initWithLibrary(new CoreErrorLibrary());
