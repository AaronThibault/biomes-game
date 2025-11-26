/**
 * Commit types for Believe's placement commit workflow.
 *
 * This module defines the canonical representation of commits, commit plans,
 * placement changes, and conflicts. These types enable the transition from
 * draft placements (editing layer) to live asset placements (world state).
 *
 * These types are contracts for future systems (commit service, conflict resolution)
 * and remain independent of persistence, spatial validation, or UI implementation.
 */

import type {
  DraftPlacementId,
  PlacementEditSessionId,
} from "@/shared/world/editing";
import type { AssetPlacement, PlacementId } from "@/shared/world/placement";

/**
 * Status of a commit in its lifecycle.
 */
export enum CommitStatus {
  /** Commit created but plan not yet prepared */
  PENDING = "PENDING",
  /** Plan prepared and ready to apply */
  READY = "READY",
  /** Successfully applied to live placements */
  APPLIED = "APPLIED",
  /** Could not be applied due to conflicts */
  REJECTED = "REJECTED",
}

/**
 * Types of conflicts that can occur when committing draft placements.
 */
export enum CommitConflictType {
  /** Transform (position/rotation/scale) has been modified by another edit */
  TRANSFORM_CONFLICT = "TRANSFORM_CONFLICT",
  /** Placement was deleted after draft was created */
  DELETION_CONFLICT = "DELETION_CONFLICT",
  /** Tags were modified by another edit */
  TAG_CONFLICT = "TAG_CONFLICT",
  /** User lacks permission to apply this change */
  PERMISSION_CONFLICT = "PERMISSION_CONFLICT",
  /** Unknown or unclassified conflict type */
  UNKNOWN = "UNKNOWN",
}

/**
 * Unique identifier for a commit.
 */
export type CommitId = string;

/**
 * Unique identifier for a conflict within a commit.
 */
export type CommitConflictId = string;

/**
 * A normalized description of one change to placements.
 *
 * Represents a single atomic change (ADD, UPDATE, or REMOVE) that will be
 * applied when the commit is executed.
 */
export interface PlacementChange {
  /** Type of change being made */
  readonly type: "ADD" | "UPDATE" | "REMOVE";

  /**
   * ID of existing live placement (for UPDATE or REMOVE operations).
   * Not set for ADD operations.
   */
  readonly placementId?: PlacementId;

  /**
   * ID of draft placement that is the source of this change.
   * Set for ADD and UPDATE operations.
   */
  readonly draftPlacementId?: DraftPlacementId;

  /**
   * Previous state of the live placement before this change.
   * Set for UPDATE and REMOVE operations.
   */
  readonly before?: AssetPlacement;

  /**
   * Resulting state of the live placement after this change.
   * Set for ADD and UPDATE operations.
   */
  readonly after?: AssetPlacement;
}

/**
 * A conflict detected during commit preparation.
 *
 * Represents a situation where a draft change cannot be cleanly applied
 * to the live world state.
 */
export interface CommitConflict {
  /** Unique identifier for this conflict */
  readonly id: CommitConflictId;

  /** Type of conflict */
  readonly type: CommitConflictType;

  /**
   * ID of the live placement involved in this conflict.
   * May not be set if the conflict is with a draft-only placement.
   */
  readonly placementId?: PlacementId;

  /**
   * ID of the draft placement involved in this conflict.
   */
  readonly draftPlacementId?: DraftPlacementId;

  /** Human-readable description of the conflict */
  readonly message: string;

  /**
   * Optional hint for how to resolve this conflict.
   * Examples: "Manually merge transforms", "Reload and retry", "Contact admin"
   */
  readonly resolutionHint?: string;
}

/**
 * Context information for a commit.
 *
 * Contains metadata about the commit request, including source session,
 * target location, and requesting user.
 */
export interface CommitContext {
  /** Unique identifier for this commit */
  readonly id: CommitId;

  /** Source editing session ID */
  readonly sessionId: PlacementEditSessionId;

  /**
   * Optional target region ID.
   * If set, this commit affects placements in this region.
   */
  readonly regionId?: string;

  /**
   * Optional target space ID.
   * If set, this commit affects placements in this space.
   */
  readonly spaceId?: string;

  /**
   * User ID of the person requesting this commit.
   * Plain string identifier; no user model import.
   */
  readonly requestedByUserId: string;

  /** Timestamp when the commit was created */
  readonly createdAt: Date;
}

/**
 * A structured plan for committing draft placements to live world state.
 *
 * Contains the list of changes to be applied and any conflicts detected.
 * Serves as a preview of what will happen before actually applying the commit.
 */
export interface CommitPlan {
  /** Commit context and metadata */
  readonly context: CommitContext;

  /**
   * List of placement changes to be applied.
   * Each change represents one ADD, UPDATE, or REMOVE operation.
   */
  readonly changes: readonly PlacementChange[];

  /**
   * List of conflicts detected during plan preparation.
   * If non-empty, the commit may be rejected or require manual resolution.
   */
  readonly conflicts: readonly CommitConflict[];

  /**
   * Flag indicating whether conflicts can be resolved automatically.
   * If true, the commit can proceed with auto-resolution.
   * If false, manual intervention is required.
   */
  readonly isResolvableAutomatically: boolean;
}

/**
 * The result of applying a commit plan.
 *
 * Contains the outcome (success or failure), list of changes that were applied,
 * and any conflicts that prevented application.
 */
export interface CommitResult {
  /** Commit context (same as the plan) */
  readonly context: CommitContext;

  /** Final status of the commit */
  readonly status: CommitStatus;

  /**
   * List of changes that were successfully applied.
   * May be empty if the commit was rejected.
   */
  readonly appliedChanges: readonly PlacementChange[];

  /**
   * List of conflicts encountered.
   * Should match the plan's conflicts list.
   */
  readonly conflicts: readonly CommitConflict[];

  /** Timestamp when the commit was completed (applied or rejected) */
  readonly completedAt: Date;
}
