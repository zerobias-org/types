/**
 * Hub Deployment Types
 *
 * Types related to module deployments - instances of modules
 * running on Hub Nodes.
 */

/**
 * Deployment type - how the module is deployed
 */
export type DeploymentType = 'container' | 'npm';

/**
 * Operational status of a deployment
 */
export type OperationalStatus = 'up' | 'down' | 'degraded' | 'pending';

/**
 * Base deployment information
 */
export interface DeploymentBase {
  /** Unique deployment ID */
  id: string;
  /** Deployment type */
  type: DeploymentType;
  /** Module package name (e.g., "@auditlogic/module-aws-s3") */
  module: string;
  /** Module version */
  version: string;
  /** Current operational status */
  status: OperationalStatus;
}

/**
 * Container deployment information
 */
export interface ContainerDeployment extends DeploymentBase {
  type: 'container';
  /** Docker image reference */
  image: string;
  /** Authentication key for this deployment */
  authKey: string;
  /** Allocated port */
  port?: number;
  /** Container ID (when running) */
  containerId?: string;
}

/**
 * NPM deployment information
 */
export interface NpmDeployment extends DeploymentBase {
  type: 'npm';
  /** Path to installed NPM package */
  packagePath?: string;
}

/**
 * Union type for all deployment types
 */
export type Deployment = ContainerDeployment | NpmDeployment;

/**
 * Deployment specification for creating new deployments
 */
export interface DeploymentSpec {
  /** Module package name */
  module: string;
  /** Module version */
  version: string;
  /** Deployment type */
  type: DeploymentType;
  /** Docker image (for container type) */
  image?: string;
}
