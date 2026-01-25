/**
 * Hub Authentication Types
 *
 * Types related to the V2 authentication protocol between
 * Hub Node and module containers.
 */

/**
 * Authentication headers used for Hub module communication
 */
export interface AuthHeaders {
  /** Deployment identifier */
  'hub-deployment-id': string;
  /** Authentication key (UUID) */
  'hub-module-auth': string;
}

/**
 * Authentication header constants
 */
export const AUTH_HEADERS = {
  /** Header name for deployment ID */
  DEPLOYMENT_ID: 'hub-deployment-id',
  /** Header name for module auth key */
  MODULE_AUTH: 'hub-module-auth'
} as const;

/**
 * Authentication header names type
 */
export type AuthHeaderName = typeof AUTH_HEADERS[keyof typeof AUTH_HEADERS];

/**
 * Authentication session information
 */
export interface AuthSession {
  /** Deployment ID this session is for */
  deploymentId: string;
  /** Authentication key (UUID) */
  authKey: string;
  /** When the session was created */
  createdAt: Date;
}

/**
 * Parse auth headers from an incoming request
 * @param headers Request headers object
 * @returns Parsed auth info or null if headers missing
 */
export function parseAuthHeaders(
  headers: Record<string, string | string[] | undefined>
): { deploymentId: string; authKey: string } | null {
  const deploymentId = headers[AUTH_HEADERS.DEPLOYMENT_ID];
  const authKey = headers[AUTH_HEADERS.MODULE_AUTH];

  if (!deploymentId || !authKey) {
    return null;
  }

  return {
    deploymentId: Array.isArray(deploymentId) ? deploymentId[0] : deploymentId,
    authKey: Array.isArray(authKey) ? authKey[0] : authKey
  };
}
