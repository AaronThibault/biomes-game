/**
 * Validation types for Believe's placement and commit validation system.
 *
 * This module defines the canonical representation of validation issues,
 * validation results, and validation inputs. These types enable pre-runtime
 * validation of placements and commits before they reach the game engine.
 *
 * These types are contracts for future validation systems and remain
 * independent of runtime, physics engines, or spatial indexing.
 */

import type { CommitPlan } from "@/shared/world/commit";
import type { DraftPlacement, DraftPlacementId } from "@/shared/world/editing";
import type { AssetPlacement, PlacementId } from "@/shared/world/placement";

/**
 * Severity level of a validation issue.
 */
export enum ValidationSeverity {
  /** Informational warning that does not block the operation */
  WARNING = "WARNING",
  /** Error that blocks the operation from proceeding */
  ERROR = "ERROR",
}

/**
 * Category of validation check.
 */
export enum ValidationType {
  /** Spatial constraints (bounds, collisions, overlaps) */
  SPATIAL = "SPATIAL",
  /** Permission and access control checks */
  PERMISSION = "PERMISSION",
  /** Data structure and field validation */
  STRUCTURAL = "STRUCTURAL",
  /** Reference validation (assetId, regionId, spaceId exist) */
  REFERENTIAL = "REFERENTIAL",
  /** Unknown or unclassified validation type */
  UNKNOWN = "UNKNOWN",
}

/**
 * Unique identifier for a validation issue.
 */
export type ValidationIssueId = string;

/**
 * A single validation issue detected during validation.
 *
 * Represents a specific problem with a placement, change, or commit plan.
 * Issues can be warnings (informational) or errors (blocking).
 */
export interface ValidationIssue {
  /** Unique identifier for this issue */
  readonly id: ValidationIssueId;

  /** Category of validation check that produced this issue */
  readonly type: ValidationType;

  /** Severity level (WARNING or ERROR) */
  readonly severity: ValidationSeverity;

  /** Human-readable description of the issue */
  readonly message: string;

  /**
   * Optional reference to the live placement involved in this issue.
   * Set for issues related to existing placements.
   */
  readonly placementId?: PlacementId;

  /**
   * Optional reference to the draft placement involved in this issue.
   * Set for issues related to draft placements.
   */
  readonly draftPlacementId?: DraftPlacementId;

  /**
   * Optional structured details for programmatic handling.
   * Can contain additional context like field names, expected vs. actual values, etc.
   */
  readonly details?: Record<string, unknown>;
}

/**
 * Result of a validation operation.
 *
 * Contains all issues detected and a flag indicating whether any are blocking.
 */
export interface ValidationResult {
  /**
   * List of all validation issues detected.
   * Empty array if no issues found.
   */
  readonly issues: readonly ValidationIssue[];

  /**
   * Flag indicating whether any ERROR-severity issues exist.
   * If true, the operation should be blocked.
   */
  readonly isBlocking: boolean;
}

/**
 * Input parameters for validating a draft placement.
 */
export interface DraftPlacementValidationInput {
  /** The draft placement to validate */
  readonly draft: DraftPlacement;

  /**
   * Optional list of current live placements.
   * Used for spatial validation (collision detection, overlap checking).
   */
  readonly livePlacements?: readonly AssetPlacement[];

  /**
   * Optional target region ID.
   * Used for bounds validation and referential checks.
   */
  readonly regionId?: string;

  /**
   * Optional target space ID.
   * Used for bounds validation and referential checks.
   */
  readonly spaceId?: string;
}

/**
 * Input parameters for validating a commit plan.
 */
export interface CommitPlanValidationInput {
  /** The commit plan to validate */
  readonly plan: CommitPlan;

  /**
   * Current live placements in the target region/space.
   * Used for validating all changes in the plan.
   */
  readonly livePlacements: readonly AssetPlacement[];
}
