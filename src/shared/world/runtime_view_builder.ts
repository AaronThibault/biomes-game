/**
 * Runtime view builder for Believe's runtime-facing read model.
 *
 * This module provides pure functions that assemble the runtime view from
 * existing Believe contracts (Regions, Placements, Commits, Validation).
 *
 * Phase 12: Now applies CommitPlan and ValidationResult to produce effective
 * placements with accurate validity flags.
 */

import type { CommitPlan, PlacementChange } from "@/shared/world/commit";
import type { AssetPlacement, PlacementId } from "@/shared/world/placement";
import type {
  RuntimePlacementView,
  RuntimeWorldView,
} from "@/shared/world/runtime_view";
import type { Region } from "@/shared/world/space";
import type {
  ValidationIssue,
  ValidationResult,
  ValidationSeverity,
} from "@/shared/world/validation/validation";

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
   * Phase 12: Now actively applied to produce effective placements.
   */
  readonly commitPlan?: CommitPlan;

  /**
   * Optional validation result to apply.
   * Phase 12: Now actively applied to set validity flags.
   */
  readonly validationResult?: ValidationResult;
}

/**
 * Apply a commit plan to base placements (internal helper).
 *
 * Processes placement changes (ADD, UPDATE, REMOVE) to produce the effective
 * set of placements after commit application.
 *
 * @param basePlacements - Base placements before commit
 * @param commitPlan - Optional commit plan to apply
 * @returns Effective placements after commit application
 */
function applyCommitPlan(
  basePlacements: readonly AssetPlacement[],
  commitPlan?: CommitPlan
): readonly AssetPlacement[] {
  if (!commitPlan) {
    return basePlacements;
  }

  // Build map: placementId -> AssetPlacement
  const placementMap = new Map<PlacementId, AssetPlacement>();
  for (const placement of basePlacements) {
    placementMap.set(placement.id, placement);
  }

  // Apply changes in order
  for (const change of commitPlan.changes) {
    applyPlacementChange(placementMap, change);
  }

  // Return effective placements
  return Array.from(placementMap.values());
}

/**
 * Apply a single placement change to the placement map (internal helper).
 *
 * @param placementMap - Mutable map of placements
 * @param change - Change to apply
 */
function applyPlacementChange(
  placementMap: Map<PlacementId, AssetPlacement>,
  change: PlacementChange
): void {
  switch (change.type) {
    case "ADD":
      // Add new placement
      if (change.after) {
        placementMap.set(change.after.id, change.after);
      }
      break;

    case "UPDATE":
      // Update existing placement
      if (change.placementId && change.after) {
        placementMap.set(change.placementId, change.after);
      }
      break;

    case "REMOVE":
      // Remove placement
      if (change.placementId) {
        placementMap.delete(change.placementId);
      }
      break;

    default:
      // Ignore unknown change types
      break;
  }
}

/**
 * Apply validation result to runtime placements (internal helper).
 *
 * Sets validity flags (isValid, hasWarnings, validationIssueIds) based on
 * validation issues.
 *
 * @param runtimePlacements - Base runtime placements
 * @param validationResult - Optional validation result to apply
 * @returns Runtime placements with validity flags set
 */
function applyValidationResult(
  runtimePlacements: readonly RuntimePlacementView[],
  validationResult?: ValidationResult
): readonly RuntimePlacementView[] {
  if (!validationResult) {
    return runtimePlacements;
  }

  // Build lookup: placementId -> { issues, hasError, hasWarning }
  const issuesByPlacement = new Map<
    PlacementId,
    { issues: ValidationIssue[]; hasError: boolean; hasWarning: boolean }
  >();

  for (const issue of validationResult.issues) {
    if (!issue.placementId) {
      continue; // Skip issues without placementId
    }

    let entry = issuesByPlacement.get(issue.placementId);
    if (!entry) {
      entry = { issues: [], hasError: false, hasWarning: false };
      issuesByPlacement.set(issue.placementId, entry);
    }

    entry.issues.push(issue);

    // Check severity
    if (issue.severity === ("ERROR" as ValidationSeverity)) {
      entry.hasError = true;
    } else if (issue.severity === ("WARNING" as ValidationSeverity)) {
      entry.hasWarning = true;
    }
  }

  // Update runtime placements with validity flags
  return runtimePlacements.map((placement) => {
    const issueEntry = issuesByPlacement.get(placement.placementId);

    if (!issueEntry) {
      // No issues for this placement
      return {
        ...placement,
        isValid: true,
        hasWarnings: false,
        validationIssueIds: undefined,
      };
    }

    // Has issues
    return {
      ...placement,
      isValid: !issueEntry.hasError,
      hasWarnings: issueEntry.hasWarning,
      validationIssueIds:
        issueEntry.issues.length > 0
          ? issueEntry.issues.map((i) => i.id)
          : undefined,
    };
  });
}

/**
 * Build a RuntimeWorldView from Believe data.
 *
 * This is a pure function that constructs a flattened, runtime-ready view
 * of the world from editing structures.
 *
 * Phase 12 behavior:
 * - Applies CommitPlan to produce effective placements
 * - Applies ValidationResult to set validity flags
 * - Returns flattened RuntimeWorldView
 *
 * @param input - Build parameters
 * @returns RuntimeWorldView with effective placements and validity flags
 */
export function buildRuntimeWorldView(
  input: BuildRuntimeWorldViewInput
): RuntimeWorldView {
  // Phase 12: Apply commit plan to get effective placements
  const effectivePlacements = applyCommitPlan(
    input.placements,
    input.commitPlan
  );

  // Map each effective placement to RuntimePlacementView
  const baseRuntimePlacements: RuntimePlacementView[] = effectivePlacements.map(
    (placement) => {
      const runtimePlacement: RuntimePlacementView = {
        placementId: placement.id,
        assetId: placement.assetId,
        regionId: placement.regionId,
        spaceId: placement.spaceId,
        transform: placement.transform,
        tags: placement.tags,
        // Default validity flags (will be updated by applyValidationResult)
        isValid: true,
        hasWarnings: false,
        validationIssueIds: undefined,
      };

      return runtimePlacement;
    }
  );

  // Phase 12: Apply validation result to set validity flags
  const finalRuntimePlacements = applyValidationResult(
    baseRuntimePlacements,
    input.validationResult
  );

  // Build RuntimeWorldView
  const runtimeView: RuntimeWorldView = {
    regions: input.regions,
    placements: finalRuntimePlacements,
  };

  return runtimeView;
}
