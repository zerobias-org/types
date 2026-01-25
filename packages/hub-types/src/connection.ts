/**
 * Hub Connection Types
 *
 * Types related to module connections - the configuration
 * passed to a module's connect() operation.
 */

/**
 * Base connection profile interface
 *
 * All connection profiles must have a type identifier.
 * Additional properties vary by module.
 */
export interface ConnectionProfile {
  /** Profile type identifier (e.g., "AwsConnectionProfile") */
  type: string;
  /** Additional profile properties */
  [key: string]: unknown;
}

/**
 * Connection state
 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Connection information
 */
export interface ConnectionInfo {
  /** Connection ID */
  id: string;
  /** Deployment ID this connection belongs to */
  deploymentId: string;
  /** Current connection state */
  state: ConnectionState;
  /** Connection profile used */
  profile: ConnectionProfile;
  /** Error message if state is 'error' */
  error?: string;
  /** When the connection was established */
  connectedAt?: Date;
}

/**
 * Connection result from connect() operation
 */
export interface ConnectResult {
  /** Whether connection succeeded */
  success: boolean;
  /** Connection ID if successful */
  connectionId?: string;
  /** Error message if failed */
  error?: string;
}

/**
 * Disconnect result
 */
export interface DisconnectResult {
  /** Whether disconnect succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
}
