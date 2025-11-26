/**
 * Runtime view builder for Believe's runtime-facing read model.
 *
 * This module provides pure functions that assemble the runtime view from
 * existing Believe contracts (Regions, Placements, Commits, Validation).
 *
 * This phase provides stub logic only — commit and validation inputs are
 * accepted for future evolution but not yet applied.
 */

import type { CommitPlan } from "@/shared/world/commit";
import type { AssetPlacement } from "@/shared/world/placement";
import type {
  RuntimePlacementView,
  RuntimeWorldView,
} from "@/shared/world/runtime_view";
import type { Region } from "@/shared/world/space";
import type { ValidationResult } from "@/shared/world/validation/validation";

/**
 * Input parameters for building a RuntimeWorldView.
 */
export interface BuildRuntimeWorldViewInput {
  /** Array of regions (spatial partitioning) */
  readonly regions: readonly Region[];

  /** Array of asset placements to include in runtime view */
  readonly placements: readonly AssetPlacement[];

  /**
   * Optional commit plan to apply.
   * Future implementations will apply placement changes from commit plan.
   */
  readonly commitPlan?: CommitPlan;

  /**
   * Optional validation result to apply.
   * Future implementations will set validity flags based on validation.
   */
  readonly validationResult?: ValidationResult;
}

/**
 * Build a RuntimeWorldView from Believe data (stub implementation).
 *
 * This is a pure function that constructs a flattened, runtime-ready view
 * of the world from editing structures.
 *
 * Current behavior (stub):
 * - Maps each AssetPlacement to RuntimePlacementView
 * - Sets all placements as valid (isValid: true, hasWarnings: false)
 * - Does not apply commitPlan or validationResult (reserved for future)
 *
 * Future implementations will:
 * - Apply placement changes from commitPlan
 * - Set validity flags based on validationResult
 * - Filter invalid placements (optional)
 * - Compute derived properties
 *
 * @param input - Build parameters
 * @returns RuntimeWorldView with flattened placements
 */
export function buildRuntimeWorldView(
  input: BuildRuntimeWorldViewInput
): RuntimeWorldView {
  // TODO: Apply commitPlan logic in future phase
  // TODO: Apply validationResult logic in future phase

  // Map each AssetPlacement to RuntimePlacementView
  const runtimePlacements: RuntimePlacementView[] = input.placements.map(
    (placement) => {
      const runtimePlacement: RuntimePlacementView = {
        placementId: placement.id,
        assetId: placement.assetId,
        regionId: placement.regionId,
        spaceId: placement.spaceId,
        transform: placement.transform,
        tags: placement.tags,
        // Stub: all placements are valid for now
        isValid: true,
        hasWarnings: false,
        validationIssueIds: [],
      };

      return runtimePlacement;
    }
  );

  // Build RuntimeWorldView
  const runtimeView: RuntimeWorldView = {
    regions: input.regions,
    placements: runtimePlacements,
  };

  return runtimeView;
}
