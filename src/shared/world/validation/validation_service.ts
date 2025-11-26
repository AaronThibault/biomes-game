/**
 * Validation service for Believe's world state.
 *
 * This module provides validation functions for draft placements,
 * commit plans, and placement changes.
 *
 * Phase 8: Contract-level service interface with stub implementations.
 * Phase 19: Wired to baseline validation rules.
 */

import type { PlacementChange } from "@/shared/world/commit";
import type { AssetPlacement } from "@/shared/world/placement";
import {
  type BaselineValidationContext,
  validateCommitPlanBaseline,
  validatePlacementChangeBaseline,
  validatePlacementsBaseline,
} from "@/shared/world/validation/baseline_rules";
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
 * Validate a draft placement (now using baseline rules).
 *
 * Validates draft placements using baseline structural, referential,
 * and spatial rules.
 *
 * @param input - Draft placement validation parameters
 * @returns Promise resolving to ValidationResult
 */
export async function validateDraftPlacementStub(
  input: DraftPlacementValidationInput
): Promise<ValidationResult> {
  // Build context with live placements + draft placement
  const placements: AssetPlacement[] = [
    ...(input.livePlacements ?? []),
    input.draft.base,
  ];

  const ctx: BaselineValidationContext = {
    regions: [],
    placements,
  };

  // Use baseline validation
  return validatePlacementsBaseline(ctx);
}

/**
 * Validate a commit plan (now using baseline rules).
 *
 * Validates commit plans using baseline structural, referential, and spatial rules.
 *
 * @param input - Commit plan validation input
 * @returns Promise resolving to ValidationResult
 */
export async function validateCommitPlanStub(
  input: CommitPlanValidationInput
): Promise<ValidationResult> {
  // Build context with live placements
  const ctx: BaselineValidationContext = {
    regions: [],
    placements: input.livePlacements,
  };

  // Use baseline validation
  return validateCommitPlanBaseline(ctx, input);
}

/**
 * Validate a single placement change (now using baseline rules).
 *
 * Validates individual placement changes using baseline structural,
 * referential, and spatial rules.
 *
 * @param change - Placement change to validate
 * @param livePlacements - Current live placements
 * @returns Promise resolving to ValidationResult
 */
export async function validatePlacementChangeStub(
  change: PlacementChange,
  livePlacements: readonly AssetPlacement[]
): Promise<ValidationResult> {
  // Build context with live placements
  const ctx: BaselineValidationContext = {
    regions: [],
    placements: livePlacements as AssetPlacement[],
  };

  // Use baseline validation
  return validatePlacementChangeBaseline(ctx, change);
}
