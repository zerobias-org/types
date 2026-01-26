/**
 * Hub Module Types
 *
 * Types related to Hub modules - OpenAPI-defined integrations
 * that run in containers or as NPM packages.
 */

/**
 * Module metadata returned from /metadata endpoint
 */
export interface ModuleMetadata {
  /** Module package name */
  name: string;
  /** Module version */
  version: string;
  /** OpenAPI specification version */
  openapi?: string;
  /** Module description */
  description?: string;
  /** Module author */
  author?: string;
  /** Additional metadata */
  [key: string]: unknown;
}

/**
 * Module health check result
 */
export interface HealthCheckResult {
  /** Whether the module is healthy */
  healthy: boolean;
  /** Module metadata if healthy */
  metadata?: ModuleMetadata;
  /** Error message if unhealthy */
  error?: string;
  /** Response time in milliseconds */
  responseTimeMs?: number;
}

/**
 * Module operation invocation request
 */
export interface InvokeRequest {
  /** Operation ID (from OpenAPI spec) */
  operationId: string;
  /** Operation parameters (path, query, header) */
  parameters?: Record<string, unknown>;
  /** Request body */
  body?: unknown;
}

/**
 * Module operation invocation result
 */
export interface InvokeResult<T = unknown> {
  /** Whether the operation succeeded */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error message if failed */
  error?: string;
  /** HTTP status code */
  statusCode: number;
  /** Response time in milliseconds */
  responseTimeMs: number;
}

/**
 * Module operation definition (from OpenAPI)
 */
export interface OperationDef {
  /** Operation ID */
  operationId: string;
  /** HTTP method */
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  /** URL path */
  path: string;
  /** Operation summary */
  summary?: string;
  /** Operation description */
  description?: string;
  /** Operation tags */
  tags?: string[];
}
