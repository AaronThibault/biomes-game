/**
 * PlanGraph types for Believe's design-intent and semantic history layer.
 *
 * This module defines TypeScript representations of PlanGraph concepts that
 * complement USD's role as canonical world state. PlanGraph captures why
 * elements exist and how they changed, while USD captures what exists.
 *
 * No file I/O, serialization, or persistence is performed in this module.
 */

/**
 * Unique identifier for a PlanNode.
 * Links to a world concept (Region, Space, Placement, Asset, Commit, etc.).
 */
export type PlanNodeId = string;

/**
 * Unique identifier for a PlanFile.
 */
export type PlanFileId = string;

/**
 * Unique identifier for a PlanFileVersion.
 */
export type PlanFileVersionId = string;

/**
 * Unique identifier for a PlanChangeRecord.
 */
export type PlanChangeId = string;

/**
 * Types of changes that can occur in a PlanGraph.
 */
export enum PlanChangeType {
  /** Node was created */
  CREATE = "CREATE",

  /** Node was modified */
  UPDATE = "UPDATE",

  /** Node was deleted */
  DELETE = "DELETE",

  /** Pure design-intent notes (no structural change) */
  INTENT = "INTENT",

  /** Linking nodes (e.g., asset ↔ placement) */
  LINK = "LINK",

  /** Removing links between nodes */
  UNLINK = "UNLINK",

  /** Other or custom change type */
  OTHER = "OTHER",
}

/**
 * A single change record in a PlanGraph.
 *
 * Represents a discrete modification to a node with reasoning and context.
 */
export interface PlanChangeRecord {
  /** Unique change identifier */
  readonly id: PlanChangeId;

  /** Node this change applies to */
  readonly nodeId: PlanNodeId;

  /** Type of change */
  readonly type: PlanChangeType;

  /** Human-readable summary of the change */
  readonly summary: string;

  /** Timestamp when change was made */
  readonly createdAt: Date;

  /** Optional user ID of change author */
  readonly createdByUserId?: string;

  /**
   * Optional extensible metadata.
   * Can include AI observations, validation results, session context, etc.
   */
  readonly metadata?: Record<string, unknown>;
}

/**
 * A version of a PlanFile at a specific point in time.
 *
 * Represents an immutable snapshot of a node's plan state with all changes
 * made in that version.
 */
export interface PlanFileVersion {
  /** Unique version identifier */
  readonly id: PlanFileVersionId;

  /** Node this version applies to */
  readonly nodeId: PlanNodeId;

  /** Timestamp when version was created */
  readonly createdAt: Date;

  /** Optional user ID of version author */
  readonly createdByUserId?: string;

  /** Array of changes in this version */
  readonly changes: readonly PlanChangeRecord[];

  /**
   * Optional extensible metadata.
   * Can include AI observations, tags, validation results, etc.
   */
  readonly metadata?: Record<string, unknown>;
}

/**
 * A PlanFile representing the complete history of a node.
 *
 * Contains all versions of a node's plan, forming an append-only history.
 */
export interface PlanFile {
  /** Unique file identifier */
  readonly id: PlanFileId;

  /** Node this file describes */
  readonly nodeId: PlanNodeId;

  /**
   * Array of versions in chronological order.
   * Append-only: versions never deleted, only added.
   */
  readonly versions: readonly PlanFileVersion[];
}

/**
 * A reference to a node in the PlanGraph.
 *
 * Links PlanNodes to USD prims and other related nodes.
 */
export interface PlanGraphNodeRef {
  /** Node identifier */
  readonly nodeId: PlanNodeId;

  /**
   * Optional link to USD prim path.
   * Connects PlanGraph to USD world state.
   */
  readonly usdPrimPath?: string;

  /**
   * Optional array of related node IDs.
   * Expresses relationships (parent/child, references, etc.).
   */
  readonly relatedNodeIds?: readonly PlanNodeId[];
}

/**
 * The complete PlanGraph for a Believe world.
 *
 * Contains all PlanFiles and relationships between nodes.
 */
export interface PlanGraph {
  /** Array of node references */
  readonly nodes: readonly PlanGraphNodeRef[];

  /** Array of plan files */
  readonly planFiles: readonly PlanFile[];
}
