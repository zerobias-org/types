/**
 * Browser import test - validates that all types can be bundled for browser use.
 * Tests all exported types from this package
 */

// Import everything from the main index to test full export chain
import {
  // Types
  Byte,
  Cidr,
  CvssVector,
  DateFormat,
  DateTime,
  Double,
  Duration,
  Email,
  Float,
  Hostname,
  IpAddress,
  OID,
  Int32,
  Int64,
  Integer,
  MacAddress,
  MimeType,
  Netmask,
  Nmtoken,
  Password,
  PhoneNumber,
  Semver,
  URL,
  UUID,
  VersionRange,
  // Core classes
  CoreType,
  PagedResults,
  CronImpl,
  // Errors
  InvalidInputError,
  NoSuchObjectError,
} from '../../src/index.js';

// Test function to verify types work at runtime
async function testTypes(): Promise<void> {
  const results: { name: string; status: 'pass' | 'fail'; error?: string }[] = [];

  // === String Format Types ===

  // Test UUID
  try {
    const id = new UUID('550e8400-e29b-41d4-a716-446655440000');
    console.log('UUID:', id.toString());
    results.push({ name: 'UUID', status: 'pass' });
  } catch (e) {
    results.push({ name: 'UUID', status: 'fail', error: String(e) });
  }

  // Test Email
  try {
    const email = new Email('test@example.com');
    console.log('Email:', email.toString());
    results.push({ name: 'Email', status: 'pass' });
  } catch (e) {
    results.push({ name: 'Email', status: 'fail', error: String(e) });
  }

  // Test URL
  try {
    const url = new URL('https://example.com/path?query=1');
    console.log('URL:', url.toString());
    results.push({ name: 'URL', status: 'pass' });
  } catch (e) {
    results.push({ name: 'URL', status: 'fail', error: String(e) });
  }

  // Test Hostname
  try {
    const hostname = new Hostname('example.com');
    console.log('Hostname:', hostname.toString());
    results.push({ name: 'Hostname', status: 'pass' });
  } catch (e) {
    results.push({ name: 'Hostname', status: 'fail', error: String(e) });
  }

  // Test Password
  try {
    const password = new Password('secret123');
    console.log('Password:', password.toString());
    results.push({ name: 'Password', status: 'pass' });
  } catch (e) {
    results.push({ name: 'Password', status: 'fail', error: String(e) });
  }

  // Test OID
  try {
    const oid = new OID('1.2.3.4.5');
    console.log('OID:', oid.toString());
    results.push({ name: 'OID', status: 'pass' });
  } catch (e) {
    results.push({ name: 'OID', status: 'fail', error: String(e) });
  }

  // Test Nmtoken
  try {
    const nmtoken = new Nmtoken('valid-token');
    console.log('Nmtoken:', nmtoken.toString());
    results.push({ name: 'Nmtoken', status: 'pass' });
  } catch (e) {
    results.push({ name: 'Nmtoken', status: 'fail', error: String(e) });
  }

  // === Network Types ===

  // Test IpAddress
  try {
    const ip = new IpAddress('192.168.1.1');
    console.log('IpAddress:', ip.toString());
    results.push({ name: 'IpAddress', status: 'pass' });
  } catch (e) {
    results.push({ name: 'IpAddress', status: 'fail', error: String(e) });
  }

  // Test Cidr
  try {
    const cidr = new Cidr('192.168.0.0/24');
    console.log('Cidr:', cidr.toString(), 'start:', cidr.startAddress(), 'end:', cidr.endAddress());
    results.push({ name: 'Cidr', status: 'pass' });
  } catch (e) {
    results.push({ name: 'Cidr', status: 'fail', error: String(e) });
  }

  // Test Netmask
  try {
    const netmask = new Netmask('255.255.255.0');
    console.log('Netmask:', netmask.toString());
    results.push({ name: 'Netmask', status: 'pass' });
  } catch (e) {
    results.push({ name: 'Netmask', status: 'fail', error: String(e) });
  }

  // Test MacAddress
  try {
    const mac = new MacAddress('00:11:22:33:44:55');
    console.log('MacAddress:', mac.toString());
    results.push({ name: 'MacAddress', status: 'pass' });
  } catch (e) {
    results.push({ name: 'MacAddress', status: 'fail', error: String(e) });
  }

  // === Numeric Types ===

  // Test Byte (base64 encoded data)
  try {
    const byte = new Byte('SGVsbG8gV29ybGQ='); // "Hello World" in base64
    console.log('Byte:', byte.toString());
    results.push({ name: 'Byte', status: 'pass' });
  } catch (e) {
    results.push({ name: 'Byte', status: 'fail', error: String(e) });
  }

  // Test Int32
  try {
    const int32 = new Int32(2_147_483_647);
    console.log('Int32:', int32.toString());
    results.push({ name: 'Int32', status: 'pass' });
  } catch (e) {
    results.push({ name: 'Int32', status: 'fail', error: String(e) });
  }

  // Test Int64
  try {
    const int64 = new Int64(9_007_199_254_740_991); // Max safe integer
    console.log('Int64:', int64.toString());
    results.push({ name: 'Int64', status: 'pass' });
  } catch (e) {
    results.push({ name: 'Int64', status: 'fail', error: String(e) });
  }

  // Test Integer
  try {
    const integer = new Integer(42);
    console.log('Integer:', integer.toString());
    results.push({ name: 'Integer', status: 'pass' });
  } catch (e) {
    results.push({ name: 'Integer', status: 'fail', error: String(e) });
  }

  // Test Float
  try {
    const float = new Float(3.14);
    console.log('Float:', float.toString());
    results.push({ name: 'Float', status: 'pass' });
  } catch (e) {
    results.push({ name: 'Float', status: 'fail', error: String(e) });
  }

  // Test Double
  try {
    const double = new Double(3.141_592_653_589_793);
    console.log('Double:', double.toString());
    results.push({ name: 'Double', status: 'pass' });
  } catch (e) {
    results.push({ name: 'Double', status: 'fail', error: String(e) });
  }

  // === Date/Time Types ===

  // Test DateTime
  try {
    const dt = new DateTime('2024-01-15T10:30:00Z');
    console.log('DateTime:', dt.toString());
    results.push({ name: 'DateTime', status: 'pass' });
  } catch (e) {
    results.push({ name: 'DateTime', status: 'fail', error: String(e) });
  }

  // Test DateFormat
  try {
    const date = new DateFormat('2024-01-15');
    console.log('DateFormat:', date.toString());
    results.push({ name: 'DateFormat', status: 'pass' });
  } catch (e) {
    results.push({ name: 'DateFormat', status: 'fail', error: String(e) });
  }

  // Test Duration
  try {
    const dur = new Duration('P1Y2M3DT4H5M6S');
    console.log('Duration:', dur.toString(), 'ms:', dur.getMilliseconds());
    results.push({ name: 'Duration', status: 'pass' });
  } catch (e) {
    results.push({ name: 'Duration', status: 'fail', error: String(e) });
  }

  // === Other Types ===

  // Test MimeType
  try {
    const mime = new MimeType('application/json');
    console.log('MimeType:', mime.toString());
    results.push({ name: 'MimeType', status: 'pass' });
  } catch (e) {
    results.push({ name: 'MimeType', status: 'fail', error: String(e) });
  }

  // Test PhoneNumber
  try {
    const phone = new PhoneNumber('+1-555-123-4567');
    console.log('PhoneNumber:', phone.toString());
    results.push({ name: 'PhoneNumber', status: 'pass' });
  } catch (e) {
    results.push({ name: 'PhoneNumber', status: 'fail', error: String(e) });
  }

  // === Version Types (CommonJS deps) ===

  // Test Semver
  try {
    const ver = new Semver('1.2.3');
    console.log('Semver:', ver.toString(), 'major:', ver.major);
    results.push({ name: 'Semver', status: 'pass' });
  } catch (e) {
    results.push({ name: 'Semver', status: 'fail', error: String(e) });
  }

  // Test VersionRange
  try {
    const range = new VersionRange('^1.0.0');
    console.log('VersionRange:', range.toString());
    results.push({ name: 'VersionRange', status: 'pass' });
  } catch (e) {
    results.push({ name: 'VersionRange', status: 'fail', error: String(e) });
  }

  // === Security Types (CommonJS deps) ===

  // Test CvssVector
  try {
    const cvss = new CvssVector('CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H');
    console.log('CvssVector:', cvss.toString(), 'score:', cvss.baseScore);
    results.push({ name: 'CvssVector', status: 'pass' });
  } catch (e) {
    results.push({ name: 'CvssVector', status: 'fail', error: String(e) });
  }

  // === Cron (CommonJS deps) ===

  // Test CronImpl
  try {
    const cron = CronImpl.fromString('0 0 * * *');
    console.log('CronImpl:', cron.toString(), 'next:', cron.next());
    results.push({ name: 'CronImpl', status: 'pass' });
  } catch (e) {
    results.push({ name: 'CronImpl', status: 'fail', error: String(e) });
  }

  // === Core Classes ===

  // Test CoreType
  try {
    const types = CoreType.listTypes();
    console.log('CoreType: found', types.length, 'types');
    results.push({ name: 'CoreType', status: 'pass' });
  } catch (e) {
    results.push({ name: 'CoreType', status: 'fail', error: String(e) });
  }

  // Test PagedResults
  try {
    const paged = new PagedResults<string>();
    console.log('PagedResults: created empty');
    results.push({ name: 'PagedResults', status: 'pass' });
  } catch (e) {
    results.push({ name: 'PagedResults', status: 'fail', error: String(e) });
  }

  // === Error Classes ===

  // Test CoreError
  try {
    const error = new InvalidInputError('test', 'bad-value', ['good-value']);
    console.log('InvalidInputError:', error.message);
    results.push({ name: 'InvalidInputError', status: 'pass' });
  } catch (e) {
    results.push({ name: 'InvalidInputError', status: 'fail', error: String(e) });
  }

  // Test NoSuchObjectError
  try {
    const error = new NoSuchObjectError('TestType', 'id-123');
    console.log('NoSuchObjectError:', error.message);
    results.push({ name: 'NoSuchObjectError', status: 'pass' });
  } catch (e) {
    results.push({ name: 'NoSuchObjectError', status: 'fail', error: String(e) });
  }

  // Summary
  console.log('\n=== Browser Test Results ===');
  for (const r of results) {
    const icon = r.status === 'pass' ? '✓' : '✗';
    console.log(`${icon} ${r.name}: ${r.status}${r.error ? ` - ${r.error}` : ''}`);
  }

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  console.log(`\nTotal: ${passed} passed, ${failed} failed`);

  // Set result on window for test runner
  (globalThis as any).__TEST_RESULTS__ = results;

  if (failed > 0) {
    throw new Error(`${failed} tests failed`);
  }
}

// Auto-run when loaded in browser
if (globalThis.window !== undefined) {
  testTypes().catch(console.error);
}

export { testTypes };
