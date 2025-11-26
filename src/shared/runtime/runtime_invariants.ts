/**
 * Runtime Invariants Module for Believe's runtime consistency checks.
 *
 * This module provides pure, deterministic invariant checks for the Believe
 * runtime stack to ensure self-consistency across world views, diffs, validation,
 * linkage, and spatial indexing.
 *
 * **Design Principles:**
 * - Pure functions only (no side effects)
 * - Deterministic output (same inputs → same output)
 * - Non-throwing (return violations instead of throwing)
 * - Conservative checks (skip if data unavailable)
 *
 * Phase 22: Runtime Invariant Checks & Consistency Harness
 */

import type { RuntimeLinkingIndex } from "@/shared/linking/runtime_linking";
import type { RuntimeWorldDiff } from "@/shared/runtime/runtime_diff";
import type { RuntimeSpatialIndex } from "@/shared/world/runtime_spatial_index";
import type { RuntimeWorldView } from "@/shared/world/runtime_view";
import type { ValidationResult } from "@/shared/world/validation/validation";

/**
 * Severity level for invariant violations.
 */
export enum RuntimeInvariantSeverity {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

/**
 * Unique identifier for an invariant check.
 */
export type RuntimeInvariantId = string;

/**
 * A single invariant violation.
 */
export interface RuntimeInvariantViolation {
  /** Unique identifier for this invariant */
  readonly id: RuntimeInvariantId;
  /** Severity level */
  readonly severity: RuntimeInvariantSeverity;
  /** Human-readable message */
  readonly message: string;
  /** Optional structured details for debugging */
  readonly details?: Record<string, unknown>;
}

/**
 * Context for invariant checking.
 *
 * All fields except worldView are optional. Checks will be skipped
 * if the required data is not provided.
 */
export interface RuntimeInvariantContext {
  /** Required: The world view to check */
  readonly worldView: RuntimeWorldView;
  /** Optional: Spatial index for coherence checks */
  readonly spatialIndex?: RuntimeSpatialIndex;
  /** Optional: Diff for disjointness checks */
  readonly diff?: RuntimeWorldDiff;
  /** Optional: Validation result for referential integrity */
  readonly validationResult?: ValidationResult;
  /** Optional: Linking index for USD/PlanGraph consistency */
  readonly linkingIndex?: RuntimeLinkingIndex;
}

/**
 * Report of all invariant violations found.
 */
export interface RuntimeInvariantReport {
  /** All violations found */
  readonly violations: readonly RuntimeInvariantViolation[];
  /** True if any ERROR-level violations were found */
  readonly hasErrors: boolean;
  /** True if any WARNING-level violations were found */
  readonly hasWarnings: boolean;
}

/**
 * Check all runtime invariants for the given context.
 *
 * This is the main entry point for invariant checking. It runs all
 * applicable checks based on the provided context and returns a report.
 *
 * @param ctx - Context containing world view and optional additional data
 * @returns Report with all violations found
 */
export function checkRuntimeInvariants(
  ctx: RuntimeInvariantContext
): RuntimeInvariantReport {
  const violations: RuntimeInvariantViolation[] = [];

  // WorldView invariants (always run)
  violations.push(...checkWorldViewInvariants(ctx.worldView));

  // Spatial index invariants (if provided)
  if (ctx.spatialIndex) {
    violations.push(
      ...checkSpatialIndexInvariants(ctx.worldView, ctx.spatialIndex)
    );
  }

  // Diff invariants (if provided)
  if (ctx.diff) {
    violations.push(...checkDiffInvariants(ctx.diff));
  }

  // Validation invariants (if provided)
  if (ctx.validationResult) {
    violations.push(
      ...checkValidationInvariants(ctx.worldView, ctx.validationResult)
    );
  }

  // Linkage invariants (if provided)
  if (ctx.linkingIndex) {
    violations.push(...checkLinkageInvariants(ctx.worldView, ctx.linkingIndex));
  }

  // Derive summary flags
  const hasErrors = violations.some(
    (v) => v.severity === RuntimeInvariantSeverity.ERROR
  );
  const hasWarnings = violations.some(
    (v) => v.severity === RuntimeInvariantSeverity.WARNING
  );

  return {
    violations,
    hasErrors,
    hasWarnings,
  };
}

/**
 * Check WorldView-level invariants.
 */
function checkWorldViewInvariants(
  worldView: RuntimeWorldView
): RuntimeInvariantViolation[] {
  const violations: RuntimeInvariantViolation[] = [];

  // Check 1: Placement ID uniqueness
  const placementIds = new Set<string>();
  const duplicates = new Set<string>();

  for (const placement of worldView.placements) {
    if (placementIds.has(placement.placementId)) {
      duplicates.add(placement.placementId);
    }
    placementIds.add(placement.placementId);
  }

  for (const duplicateId of duplicates) {
    violations.push({
      id: "world.placement_id_not_unique",
      severity: RuntimeInvariantSeverity.ERROR,
      message: `Placement ID "${duplicateId}" appears multiple times in worldView.placements`,
      details: { placementId: duplicateId },
    });
  }

  // Check 2: Region references
  const regionIds = new Set(worldView.regions.map((r) => r.id));

  for (const placement of worldView.placements) {
    if (placement.regionId && !regionIds.has(placement.regionId)) {
      violations.push({
        id: "world.placement_region_not_found",
        severity: RuntimeInvariantSeverity.ERROR,
        message: `Placement "${placement.placementId}" references region "${placement.regionId}" which does not exist in worldView.regions`,
        details: {
          placementId: placement.placementId,
          regionId: placement.regionId,
        },
      });
    }
  }

  // Check 3: Space references (conservative check)
  // Region.spaces is an array of space IDs, so we can check if placement.spaceId
  // exists in the corresponding region's spaces array
  const regionSpacesMap = new Map<string, Set<string>>();
  for (const region of worldView.regions) {
    regionSpacesMap.set(region.id, new Set(region.spaces));
  }

  for (const placement of worldView.placements) {
    if (placement.spaceId && placement.regionId) {
      const regionSpaces = regionSpacesMap.get(placement.regionId);
      if (regionSpaces && !regionSpaces.has(placement.spaceId)) {
        violations.push({
          id: "world.placement_space_not_in_region",
          severity: RuntimeInvariantSeverity.ERROR,
          message: `Placement "${placement.placementId}" references space "${placement.spaceId}" which is not in region "${placement.regionId}"`,
          details: {
            placementId: placement.placementId,
            spaceId: placement.spaceId,
            regionId: placement.regionId,
          },
        });
      }
    }
  }

  return violations;
}

/**
 * Check spatial index coherence invariants.
 */
function checkSpatialIndexInvariants(
  worldView: RuntimeWorldView,
  spatialIndex: RuntimeSpatialIndex
): RuntimeInvariantViolation[] {
  const violations: RuntimeInvariantViolation[] = [];

  // Check 1: getPlacementsInRegion returns only placements with matching regionId
  for (const region of worldView.regions) {
    const placementsInRegion = spatialIndex.getPlacementsInRegion(region.id);

    for (const placement of placementsInRegion) {
      if (placement.regionId !== region.id) {
        violations.push({
          id: "spatial.placement_region_mismatch",
          severity: RuntimeInvariantSeverity.ERROR,
          message: `Spatial index returned placement "${placement.placementId}" for region "${region.id}" but placement.regionId is "${placement.regionId}"`,
          details: {
            placementId: placement.placementId,
            expectedRegionId: region.id,
            actualRegionId: placement.regionId,
          },
        });
      }
    }
  }

  // Check 2: Spot-check retrieval by region/space
  // Pick first 2 placements and verify they can be retrieved
  const samplePlacements = worldView.placements.slice(0, 2);

  for (const placement of samplePlacements) {
    if (placement.regionId) {
      const placementsInRegion = spatialIndex.getPlacementsInRegion(
        placement.regionId
      );
      const found = placementsInRegion.some(
        (p) => p.placementId === placement.placementId
      );

      if (!found) {
        violations.push({
          id: "spatial.placement_not_retrievable_by_region",
          severity: RuntimeInvariantSeverity.WARNING,
          message: `Placement "${placement.placementId}" in region "${placement.regionId}" could not be retrieved via spatial index`,
          details: {
            placementId: placement.placementId,
            regionId: placement.regionId,
          },
        });
      }
    }

    if (placement.spaceId) {
      const placementsInSpace = spatialIndex.getPlacementsInSpace(
        placement.spaceId
      );
      const found = placementsInSpace.some(
        (p) => p.placementId === placement.placementId
      );

      if (!found) {
        violations.push({
          id: "spatial.placement_not_retrievable_by_space",
          severity: RuntimeInvariantSeverity.WARNING,
          message: `Placement "${placement.placementId}" in space "${placement.spaceId}" could not be retrieved via spatial index`,
          details: {
            placementId: placement.placementId,
            spaceId: placement.spaceId,
          },
        });
      }
    }
  }

  return violations;
}

/**
 * Check diff disjointness invariants.
 */
function checkDiffInvariants(
  diff: RuntimeWorldDiff
): RuntimeInvariantViolation[] {
  const violations: RuntimeInvariantViolation[] = [];

  // Build sets of placement IDs in each category
  const addedIds = new Set(diff.added.map((d) => d.placementId));
  const removedIds = new Set(diff.removed.map((d) => d.placementId));
  const updatedIds = new Set(diff.updated.map((d) => d.placementId));

  // Check 1: added and removed are disjoint
  for (const id of addedIds) {
    if (removedIds.has(id)) {
      violations.push({
        id: "diff.added_and_removed_overlap",
        severity: RuntimeInvariantSeverity.ERROR,
        message: `Placement "${id}" appears in both diff.added and diff.removed`,
        details: { placementId: id },
      });
    }
  }

  // Check 2: added and updated are disjoint
  for (const id of addedIds) {
    if (updatedIds.has(id)) {
      violations.push({
        id: "diff.added_and_updated_overlap",
        severity: RuntimeInvariantSeverity.ERROR,
        message: `Placement "${id}" appears in both diff.added and diff.updated`,
        details: { placementId: id },
      });
    }
  }

  // Check 3: removed and updated are disjoint
  for (const id of removedIds) {
    if (updatedIds.has(id)) {
      violations.push({
        id: "diff.removed_and_updated_overlap",
        severity: RuntimeInvariantSeverity.ERROR,
        message: `Placement "${id}" appears in both diff.removed and diff.updated`,
        details: { placementId: id },
      });
    }
  }

  return violations;
}

/**
 * Check validation referential integrity invariants.
 */
function checkValidationInvariants(
  worldView: RuntimeWorldView,
  validationResult: ValidationResult
): RuntimeInvariantViolation[] {
  const violations: RuntimeInvariantViolation[] = [];

  const placementIds = new Set(worldView.placements.map((p) => p.placementId));

  // Check: Every validation issue that references a placementId must refer to
  // a placement that exists in worldView.placements
  for (const issue of validationResult.issues) {
    if (issue.placementId && !placementIds.has(issue.placementId)) {
      violations.push({
        id: "validation.issue_references_missing_placement",
        severity: RuntimeInvariantSeverity.WARNING,
        message: `Validation issue "${issue.id}" references placement "${issue.placementId}" which does not exist in worldView.placements`,
        details: {
          issueId: issue.id,
          placementId: issue.placementId,
        },
      });
    }

    // Also check draftPlacementId if present
    if (issue.draftPlacementId && !placementIds.has(issue.draftPlacementId)) {
      violations.push({
        id: "validation.issue_references_missing_draft_placement",
        severity: RuntimeInvariantSeverity.WARNING,
        message: `Validation issue "${issue.id}" references draft placement "${issue.draftPlacementId}" which does not exist in worldView.placements`,
        details: {
          issueId: issue.id,
          draftPlacementId: issue.draftPlacementId,
        },
      });
    }
  }

  return violations;
}

/**
 * Check linkage consistency invariants.
 */
function checkLinkageInvariants(
  worldView: RuntimeWorldView,
  linkingIndex: RuntimeLinkingIndex
): RuntimeInvariantViolation[] {
  const violations: RuntimeInvariantViolation[] = [];

  const placementIds = new Set(worldView.placements.map((p) => p.placementId));
  const regionIds = new Set(worldView.regions.map((r) => r.id));

  // Check 1: Every placementId in linkingIndex.byPlacementId exists in worldView.placements
  for (const [placementId, linkage] of Object.entries(
    linkingIndex.byPlacementId
  )) {
    if (!placementIds.has(placementId)) {
      violations.push({
        id: "linking.placement_not_in_world",
        severity: RuntimeInvariantSeverity.ERROR,
        message: `Linking index contains placement "${placementId}" which does not exist in worldView.placements`,
        details: { placementId },
      });
    }

    // Check USD prim path is non-empty
    if (!linkage.usdPrimPath || linkage.usdPrimPath.trim() === "") {
      violations.push({
        id: "linking.empty_usd_prim_path",
        severity: RuntimeInvariantSeverity.ERROR,
        message: `Placement "${placementId}" has empty USD prim path in linking index`,
        details: { placementId },
      });
    }

    // Check PlanGraph node ID is non-empty
    if (!linkage.planNodeId || linkage.planNodeId.trim() === "") {
      violations.push({
        id: "linking.empty_plan_node_id",
        severity: RuntimeInvariantSeverity.ERROR,
        message: `Placement "${placementId}" has empty PlanGraph node ID in linking index`,
        details: { placementId },
      });
    }
  }

  // Check 2: Every regionId in linkingIndex.byRegionId exists in worldView.regions
  for (const [regionId, linkage] of Object.entries(linkingIndex.byRegionId)) {
    if (!regionIds.has(regionId)) {
      violations.push({
        id: "linking.region_not_in_world",
        severity: RuntimeInvariantSeverity.ERROR,
        message: `Linking index contains region "${regionId}" which does not exist in worldView.regions`,
        details: { regionId },
      });
    }

    // Check USD prim path is non-empty
    if (!linkage.usdPrimPath || linkage.usdPrimPath.trim() === "") {
      violations.push({
        id: "linking.empty_usd_prim_path_region",
        severity: RuntimeInvariantSeverity.ERROR,
        message: `Region "${regionId}" has empty USD prim path in linking index`,
        details: { regionId },
      });
    }

    // Check PlanGraph node ID is non-empty
    if (!linkage.planNodeId || linkage.planNodeId.trim() === "") {
      violations.push({
        id: "linking.empty_plan_node_id_region",
        severity: RuntimeInvariantSeverity.ERROR,
        message: `Region "${regionId}" has empty PlanGraph node ID in linking index`,
        details: { regionId },
      });
    }
  }

  return violations;
}
