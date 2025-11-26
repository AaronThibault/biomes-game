/**
 * Baseline validation rules for Believe's validation system.
 *
 * This module implements minimal but useful validation logic:
 * - Structural sanity checks (IDs, transforms, scale bounds)
 * - Referential integrity (region/space existence, commit references)
 * - Simple spatial overlap detection (point-based)
 *
 * Phase 19: Pure TypeScript, deterministic, engine-agnostic.
 */

import type { PlacementChange } from "@/shared/world/commit";
import type {
  AssetPlacement,
  PlacementId,
  Transform,
} from "@/shared/world/placement";
import type { Region } from "@/shared/world/space";
import type {
  CommitPlanValidationInput,
  ValidationIssue,
  ValidationResult,
} from "@/shared/world/validation/validation";
import {
  ValidationSeverity,
  ValidationType,
} from "@/shared/world/validation/validation";

/**
 * Context for baseline validation containing world state.
 */
export interface BaselineValidationContext {
  /** Regions in the world */
  readonly regions: readonly Region[];

  /** Asset placements to validate */
  readonly placements: readonly AssetPlacement[];
}

/**
 * Validate placements using baseline rules.
 *
 * Applies:
 * - Structural checks (missing IDs, transform sanity, scale bounds)
 * - Referential checks (region/space existence)
 * - Spatial checks (simple point-based overlap)
 *
 * @param ctx - Validation context
 * @returns ValidationResult with issues
 */
export function validatePlacementsBaseline(
  ctx: BaselineValidationContext
): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Validate each placement
  for (const placement of ctx.placements) {
    // Structural checks
    issues.push(...validateStructural(placement));

    // Referential checks
    issues.push(...validateReferential(ctx, placement));
  }

  // Spatial checks (overlap detection)
  issues.push(...validateSpatialOverlap(ctx));

  // Determine if blocking
  const isBlocking = issues.some(
    (issue) => issue.severity === ValidationSeverity.ERROR
  );

  return {
    issues,
    isBlocking,
  };
}

/**
 * Validate commit plan using baseline rules.
 *
 * Applies:
 * - Structural checks on placements in changes
 * - Referential checks (UPDATE/REMOVE must reference existing, ADD must not duplicate)
 *
 * @param ctx - Validation context
 * @param input - Commit plan validation input
 * @returns ValidationResult with issues
 */
export function validateCommitPlanBaseline(
  ctx: BaselineValidationContext,
  input: CommitPlanValidationInput
): ValidationResult {
  const issues: ValidationIssue[] = [];

  for (const change of input.plan.changes) {
    issues.push(...validatePlacementChangeBaseline(ctx, change).issues);
  }

  const isBlocking = issues.some(
    (issue) => issue.severity === ValidationSeverity.ERROR
  );

  return {
    issues,
    isBlocking,
  };
}

/**
 * Validate a single placement change using baseline rules.
 *
 * @param ctx - Validation context
 * @param change - Placement change to validate
 * @returns ValidationResult with issues
 */
export function validatePlacementChangeBaseline(
  ctx: BaselineValidationContext,
  change: PlacementChange
): ValidationResult {
  const issues: ValidationIssue[] = [];

  switch (change.type) {
    case "ADD":
      if (change.after) {
        // Check for duplicate placementId
        const existingPlacement = ctx.placements.find(
          (p) => p.id === change.after!.id
        );
        if (existingPlacement) {
          issues.push({
            id: `duplicate-id-${change.after.id}`,
            placementId: change.after.id,
            severity: ValidationSeverity.ERROR,
            type: ValidationType.REFERENTIAL,
            message: `ADD change references duplicate placementId: ${change.after.id}`,
            details: {
              rule: "commit-add-duplicate-check",
            },
          });
        }

        // Structural checks on new placement
        issues.push(...validateStructural(change.after));

        // Referential checks on new placement
        issues.push(...validateReferential(ctx, change.after));
      }
      break;

    case "UPDATE":
      // Check that referenced placement exists
      if (change.placementId) {
        const existingPlacement = ctx.placements.find(
          (p) => p.id === change.placementId
        );
        if (!existingPlacement) {
          issues.push({
            id: `missing-update-ref-${change.placementId}`,
            placementId: change.placementId,
            severity: ValidationSeverity.ERROR,
            type: ValidationType.REFERENTIAL,
            message: `UPDATE change references nonexistent placementId: ${change.placementId}`,
            details: {
              rule: "commit-update-reference-check",
            },
          });
        }
      }

      // Structural checks on updated placement
      if (change.after) {
        issues.push(...validateStructural(change.after));
        issues.push(...validateReferential(ctx, change.after));
      }
      break;

    case "REMOVE":
      // Check that referenced placement exists
      if (change.placementId) {
        const existingPlacement = ctx.placements.find(
          (p) => p.id === change.placementId
        );
        if (!existingPlacement) {
          issues.push({
            id: `missing-remove-ref-${change.placementId}`,
            placementId: change.placementId,
            severity: ValidationSeverity.ERROR,
            type: ValidationType.REFERENTIAL,
            message: `REMOVE change references nonexistent placementId: ${change.placementId}`,
            details: {
              rule: "commit-remove-reference-check",
            },
          });
        }
      }
      break;
  }

  const isBlocking = issues.some(
    (issue) => issue.severity === ValidationSeverity.ERROR
  );

  return {
    issues,
    isBlocking,
  };
}

/**
 * Validate structural properties of a placement.
 *
 * Checks:
 * - Missing/empty placementId → ERROR
 * - Missing/empty assetId → ERROR
 * - Transform containing NaN/Infinity → ERROR
 * - Scale ≤ 0 → ERROR
 * - Scale > 1000 → WARNING
 *
 * @param placement - Placement to validate
 * @returns Array of validation issues
 */
function validateStructural(placement: AssetPlacement): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check for missing/empty placementId
  if (!placement.id || placement.id.trim() === "") {
    issues.push({
      id: `missing-placement-id-${Date.now()}`,
      placementId: placement.id,
      severity: ValidationSeverity.ERROR,
      type: ValidationType.STRUCTURAL,
      message: "Placement has missing or empty placementId",
      details: {
        rule: "placement-id-required",
      },
    });
  }

  // Check for missing/empty assetId
  if (!placement.assetId || placement.assetId.trim() === "") {
    issues.push({
      id: `missing-asset-id-${placement.id}`,
      placementId: placement.id,
      severity: ValidationSeverity.ERROR,
      type: ValidationType.STRUCTURAL,
      message: "Placement has missing or empty assetId",
      details: {
        rule: "asset-id-required",
      },
    });
  }

  // Check transform sanity
  issues.push(...validateTransform(placement.id, placement.transform));

  return issues;
}

/**
 * Validate transform sanity.
 *
 * Checks:
 * - Position/rotation/scale containing NaN/Infinity → ERROR
 * - Scale ≤ 0 → ERROR
 * - Scale > 1000 → WARNING
 *
 * @param placementId - Placement ID for error reporting
 * @param transform - Transform to validate
 * @returns Array of validation issues
 */
function validateTransform(
  placementId: PlacementId,
  transform: Transform
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check position
  if (
    !isFinite(transform.position.x) ||
    !isFinite(transform.position.y) ||
    !isFinite(transform.position.z)
  ) {
    issues.push({
      id: `invalid-position-${placementId}`,
      placementId,
      severity: ValidationSeverity.ERROR,
      type: ValidationType.STRUCTURAL,
      message: "Transform position contains NaN or Infinity",
      details: {
        rule: "transform-position-sanity",
        position: transform.position,
      },
    });
  }

  // Check rotation
  if (
    !isFinite(transform.rotation.x) ||
    !isFinite(transform.rotation.y) ||
    !isFinite(transform.rotation.z) ||
    !isFinite(transform.rotation.w)
  ) {
    issues.push({
      id: `invalid-rotation-${placementId}`,
      placementId,
      severity: ValidationSeverity.ERROR,
      type: ValidationType.STRUCTURAL,
      message: "Transform rotation contains NaN or Infinity",
      details: {
        rule: "transform-rotation-sanity",
        rotation: transform.rotation,
      },
    });
  }

  // Check scale
  if (
    !isFinite(transform.scale.x) ||
    !isFinite(transform.scale.y) ||
    !isFinite(transform.scale.z)
  ) {
    issues.push({
      id: `invalid-scale-nan-${placementId}`,
      placementId,
      severity: ValidationSeverity.ERROR,
      type: ValidationType.STRUCTURAL,
      message: "Transform scale contains NaN or Infinity",
      details: {
        rule: "transform-scale-sanity",
        scale: transform.scale,
      },
    });
  }

  // Check scale ≤ 0
  if (
    transform.scale.x <= 0 ||
    transform.scale.y <= 0 ||
    transform.scale.z <= 0
  ) {
    issues.push({
      id: `invalid-scale-zero-${placementId}`,
      placementId,
      severity: ValidationSeverity.ERROR,
      type: ValidationType.STRUCTURAL,
      message: "Transform scale must be positive",
      details: {
        rule: "transform-scale-positive",
        scale: transform.scale,
      },
    });
  }

  // Check scale > 1000 (warning)
  if (
    transform.scale.x > 1000 ||
    transform.scale.y > 1000 ||
    transform.scale.z > 1000
  ) {
    issues.push({
      id: `large-scale-${placementId}`,
      placementId,
      severity: ValidationSeverity.WARNING,
      type: ValidationType.STRUCTURAL,
      message: "Transform scale unusually large (> 1000)",
      details: {
        rule: "transform-scale-threshold",
        scale: transform.scale,
        threshold: 1000,
      },
    });
  }

  return issues;
}

/**
 * Validate referential integrity of a placement.
 *
 * Checks:
 * - regionId exists in context.regions → ERROR if not
 *
 * @param ctx - Validation context
 * @param placement - Placement to validate
 * @returns Array of validation issues
 */
function validateReferential(
  ctx: BaselineValidationContext,
  placement: AssetPlacement
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check regionId exists
  if (placement.regionId) {
    const region = ctx.regions.find((r) => r.id === placement.regionId);
    if (!region) {
      issues.push({
        id: `missing-region-${placement.id}`,
        placementId: placement.id,
        severity: ValidationSeverity.ERROR,
        type: ValidationType.REFERENTIAL,
        message: `Placement references nonexistent regionId: ${placement.regionId}`,
        details: {
          rule: "region-existence-check",
          regionId: placement.regionId,
        },
      });
    }
  }

  return issues;
}

/**
 * Validate spatial overlap (simple point-based detection).
 *
 * Within each region, if two placements have exactly identical position,
 * create WARNING for each placement involved.
 *
 * @param ctx - Validation context
 * @returns Array of validation issues
 */
function validateSpatialOverlap(
  ctx: BaselineValidationContext
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Group placements by region
  const placementsByRegion = new Map<string, AssetPlacement[]>();
  for (const placement of ctx.placements) {
    if (placement.regionId) {
      const regionPlacements = placementsByRegion.get(placement.regionId) || [];
      regionPlacements.push(placement);
      placementsByRegion.set(placement.regionId, regionPlacements);
    }
  }

  // Check for overlaps within each region
  for (const [, placements] of placementsByRegion) {
    // Build position map
    const positionMap = new Map<string, AssetPlacement[]>();
    for (const placement of placements) {
      const posKey = `${placement.transform.position.x},${placement.transform.position.y},${placement.transform.position.z}`;
      const atPosition = positionMap.get(posKey) || [];
      atPosition.push(placement);
      positionMap.set(posKey, atPosition);
    }

    // Report overlaps
    for (const [posKey, atPosition] of positionMap) {
      if (atPosition.length > 1) {
        for (const placement of atPosition) {
          issues.push({
            id: `spatial-overlap-${placement.id}`,
            placementId: placement.id,
            severity: ValidationSeverity.WARNING,
            type: ValidationType.SPATIAL,
            message: `Placement overlaps with ${
              atPosition.length - 1
            } other placement(s) at position ${posKey}`,
            details: {
              rule: "spatial-point-overlap",
              position: placement.transform.position,
              overlappingCount: atPosition.length - 1,
            },
          });
        }
      }
    }
  }

  return issues;
}
