/**
 * Validation service API surface for Believe's placement and commit validation.
 *
 * This module defines the interface for validating draft placements, commit plans,
 * and individual placement changes. It provides stub implementations for testing
 * and serves as a contract for future validation service implementations.
 *
 * This phase provides stub implementations only — actual validation logic
 * (spatial checks, permission verification, referential validation) will be
 * added in future phases.
 */

import type { PlacementChange } from "@/shared/world/commit";
import type { AssetPlacement } from "@/shared/world/placement";
import type {
  CommitPlanValidationInput,
  DraftPlacementValidationInput,
  ValidationResult,
} from "@/shared/world/validation/validation";

/**
 * Service interface for validation operations.
 *
 * This interface defines the contract for validating placements and commits.
 * Future implementations will provide actual spatial, permission, structural,
 * and referential validation logic.
 */
export interface ValidationService {
  /**
   * Validate a draft placement before committing.
   *
   * Checks spatial constraints, permissions, structural validity,
   * and referential integrity.
   *
   * @param input - Draft placement validation parameters
   * @returns Promise resolving to validation result
   */
  validateDraftPlacement(
    input: DraftPlacementValidationInput
  ): Promise<ValidationResult>;

  /**
   * Validate a commit plan before applying.
   *
   * Validates all changes in the plan, checking for spatial conflicts,
   * permission issues, and structural problems.
   *
   * @param input - Commit plan validation parameters
   * @returns Promise resolving to validation result
   */
  validateCommitPlan(
    input: CommitPlanValidationInput
  ): Promise<ValidationResult>;

  /**
   * Validate a single placement change.
   *
   * Checks whether an individual ADD, UPDATE, or REMOVE operation
   * is valid against current live placements.
   *
   * @param change - The placement change to validate
   * @param livePlacements - Current live placements
   * @returns Promise resolving to validation result
   */
  validatePlacementChange(
    change: PlacementChange,
    livePlacements: readonly AssetPlacement[]
  ): Promise<ValidationResult>;
}

/**
 * Validate a draft placement (stub implementation).
 *
 * This is a pure stub that returns no validation issues.
 * Future implementations will:
 * - Check required fields (assetId, transform, etc.)
 * - Validate transform components (position, rotation, scale)
 * - Verify assetId references existing BelieveAsset
 * - Check regionId/spaceId references exist
 * - Perform spatial bounds checking
 * - Detect collisions with live placements
 * - Verify user has EDIT_PLACEMENTS permission
 *
 * @param input - Draft placement validation parameters
 * @returns Promise resolving to validation result (always empty in stub)
 */
export async function validateDraftPlacementStub(
  _input: DraftPlacementValidationInput
): Promise<ValidationResult> {
  // TODO: Replace with real validation logic.
  // For now, return no issues and isBlocking = false.

  const result: ValidationResult = {
    issues: [],
    isBlocking: false,
  };

  return result;
}

/**
 * Validate a commit plan (stub implementation).
 *
 * This is a pure stub that returns no validation issues.
 * Future implementations will:
 * - Validate commit context (session exists, user has MANAGE_COMMITS)
 * - Validate each placement change in the plan
 * - Check for conflicts between changes
 * - Verify atomic consistency (all changes can apply together)
 * - Aggregate issues from all changes
 *
 * @param input - Commit plan validation parameters
 * @returns Promise resolving to validation result (always empty in stub)
 */
export async function validateCommitPlanStub(
  _input: CommitPlanValidationInput
): Promise<ValidationResult> {
  // TODO: Replace with real validation logic.
  // For now, return no issues and isBlocking = false.

  const result: ValidationResult = {
    issues: [],
    isBlocking: false,
  };

  return result;
}

/**
 * Validate a single placement change (stub implementation).
 *
 * This is a pure stub that returns no validation issues.
 * Future implementations will:
 * - For ADD: validate as new draft placement
 * - For UPDATE: verify source placement exists, validate new state
 * - For REMOVE: verify placement exists and can be removed
 * - Check change-specific constraints
 *
 * @param change - The placement change to validate
 * @param livePlacements - Current live placements
 * @returns Promise resolving to validation result (always empty in stub)
 */
export async function validatePlacementChangeStub(
  _change: PlacementChange,
  _livePlacements: readonly AssetPlacement[]
): Promise<ValidationResult> {
  // TODO: Replace with real validation logic.
  // For now, return no issues and isBlocking = false.

  const result: ValidationResult = {
    issues: [],
    isBlocking: false,
  };

  return result;
}
