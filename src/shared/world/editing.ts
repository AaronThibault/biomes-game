/**
 * Editing types for Believe's placement editing system.
 *
 * This module defines the canonical representation of editing sessions,
 * draft placements, and edit operations. These types enable UGC creators,
 * teachers, and administrators to safely propose changes to asset placements
 * before committing them to the live world.
 *
 * These types are contracts for future systems (editors, services, tools)
 * and remain independent of persistence, networking, or UI implementation.
 */

import type {
  AssetPlacement,
  PlacementId,
  Transform,
} from "@/shared/world/placement";

/**
 * Types of operations that can be performed on placements within an editing session.
 */
export enum PlacementEditOperationType {
  /** Add a new placement to the session */
  ADD = "ADD",
  /** Update the transform (position, rotation, scale) of a placement */
  UPDATE_TRANSFORM = "UPDATE_TRANSFORM",
  /** Update the tags of a placement */
  UPDATE_TAGS = "UPDATE_TAGS",
  /** Remove a placement from the session */
  REMOVE = "REMOVE",
}

/**
 * Status of a placement editing session.
 */
export enum PlacementEditSessionStatus {
  /** Session is active and accepting operations */
  ACTIVE = "ACTIVE",
  /** Session is closed and no longer accepting operations */
  CLOSED = "CLOSED",
}

/**
 * Unique identifier for a placement editing session.
 */
export type PlacementEditSessionId = string;

/**
 * Unique identifier for a draft placement within an editing session.
 */
export type DraftPlacementId = string;

/**
 * A draft placement that exists only within an editing session.
 *
 * Draft placements are structurally similar to AssetPlacement but exist
 * in a temporary editing context. They can be modified multiple times
 * before being published to the live world.
 */
export interface DraftPlacement {
  /** Unique identifier for this draft placement */
  readonly draftId: DraftPlacementId;

  /**
   * The base placement data.
   * Contains all standard AssetPlacement properties (assetId, transform, tags, etc.)
   */
  readonly base: AssetPlacement;

  /**
   * Flag indicating if this is a new placement (true) or modification of existing (false).
   * New placements have no corresponding live AssetPlacement.
   */
  readonly isNew?: boolean;

  /**
   * Optional reference to the source placement ID if this draft was derived
   * from an existing live placement.
   */
  readonly sourcePlacementId?: PlacementId;
}

/**
 * A single atomic edit operation within a placement editing session.
 *
 * Operations are immutable records of changes applied to placements.
 * They provide an audit trail and enable undo/redo functionality.
 */
export interface PlacementEditOperation {
  /** Unique identifier for this operation */
  readonly id: string;

  /** Parent session identifier */
  readonly sessionId: PlacementEditSessionId;

  /** Type of operation being performed */
  readonly type: PlacementEditOperationType;

  /**
   * Target placement ID for UPDATE or REMOVE operations on live placements.
   * Used when modifying an existing placement that was loaded into the session.
   */
  readonly targetPlacementId?: PlacementId;

  /**
   * Target draft ID for operations on draft placements.
   * Used when modifying a draft that was created in this session.
   */
  readonly targetDraftId?: DraftPlacementId;

  /**
   * New placement data for ADD operations or full replacement.
   * Contains the complete draft placement to be added.
   */
  readonly newPlacement?: DraftPlacement;

  /**
   * New transform for UPDATE_TRANSFORM operations.
   * Only the transform is updated; other placement properties remain unchanged.
   */
  readonly newTransform?: Transform;

  /**
   * New tags for UPDATE_TAGS operations.
   * Replaces the existing tags on the target placement.
   */
  readonly newTags?: readonly string[];

  /** Timestamp when this operation was created */
  readonly createdAt: Date;

  /**
   * User ID of the person who created this operation.
   * Plain string identifier; no user model import.
   */
  readonly createdByUserId: string;

  /** Optional notes or description of this operation */
  readonly notes?: string;
}

/**
 * A placement editing session representing a bounded period of editing activity.
 *
 * Sessions provide a safe context for proposing changes to placements in a
 * specific region or space. All changes exist as draft placements until the
 * session is published.
 */
export interface PlacementEditSession {
  /** Unique identifier for this session */
  readonly id: PlacementEditSessionId;

  /**
   * Optional target region ID for this editing session.
   * If specified, this session is editing placements in this region.
   */
  readonly regionId?: string;

  /**
   * Optional target space ID for this editing session.
   * If specified, this session is editing placements in this space.
   */
  readonly spaceId?: string;

  /** Current status of the session */
  readonly status: PlacementEditSessionStatus;

  /** Timestamp when the session was created */
  readonly createdAt: Date;

  /** Timestamp when the session was last updated */
  readonly updatedAt: Date;

  /**
   * User ID of the person who created this session.
   * Plain string identifier; no user model import.
   */
  readonly createdByUserId: string;

  /**
   * User IDs of all participants in this session.
   * Includes the creator and any other users who have joined.
   * Plain string identifiers; no user model import.
   */
  readonly participants: readonly string[];

  /**
   * Collection of draft placements in this session.
   * These are the proposed changes that will be published when the session closes.
   */
  readonly draftPlacements: readonly DraftPlacement[];

  /**
   * History of all operations applied in this session.
   * Operations are ordered chronologically and provide an audit trail.
   */
  readonly operations: readonly PlacementEditOperation[];

  /** Arbitrary tags for categorization and filtering */
  readonly tags: readonly string[];

  /** Optional notes or description of this editing session */
  readonly notes?: string;
}
