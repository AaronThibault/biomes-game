/**
 * Runtime playground harness for Believe's golden path validation.
 *
 * This module executes the entire Believe runtime pipeline (Phases 1–17)
 * in a self-contained, deterministic manner and outputs a JSON summary.
 *
 * Phase 18: Carmack-style golden path harness.
 * Phase 19: Uses real baseline validation rules.
 * Phase 20: USD ↔ PlanGraph ↔ Runtime linkage introspection.
 * Phase 21: Deterministic runtime diff engine.
 * Phase 22: Runtime invariant checks & consistency harness.
 */

import { buildRuntimeLinkingIndex } from "@/shared/linking/runtime_linking";
import type { PlanNodeId } from "@/shared/plan/plan_types";
import {
  buildRuntimeAssetBindingsStub,
  getMissingOrFailedBindingsStub,
} from "@/shared/runtime/asset_binding_service";
import { createDebugSnapshotStub } from "@/shared/runtime/debug_service";
import { EngineApplyMode } from "@/shared/runtime/engine_adapter";
import { createNoopEngineAdapter } from "@/shared/runtime/engine_adapter_service";
import { diffRuntimeWorldViews } from "@/shared/runtime/runtime_diff";
import { checkRuntimeInvariants } from "@/shared/runtime/runtime_invariants";
import type { PlacementId } from "@/shared/world/placement";
import {
  getRegionSnapshotStub,
  getWorldSnapshotStub,
} from "@/shared/world/region_streaming_service";
import { buildRuntimeSpatialIndex } from "@/shared/world/runtime_spatial_index_builder";
import { buildRuntimeWorldView } from "@/shared/world/runtime_view_builder";
import { buildRuntimePlaygroundFixture } from "./world_fixture";

/**
 * Summary of a single playground pipeline step.
 */
export interface PlaygroundStepSummary {
  /** Step name */
  readonly name: string;

  /** Optional step details */
  readonly details?: Record<string, unknown>;
}

/**
 * Complete playground execution result.
 */
export interface PlaygroundResult {
  /** RuntimeWorldView summary */
  readonly worldViewSummary: {
    readonly regionCount: number;
    readonly placementCount: number;
    readonly validCount: number;
    readonly invalidCount: number;
    readonly warningCount: number;
  };

  /** RuntimeSpatialIndex summary */
  readonly spatialIndexSummary: {
    readonly sampleNearestQuery?: {
      readonly from: { x: number; y: number; z: number };
      readonly returnedPlacementIds: readonly PlacementId[];
    };
  };

  /** Region streaming summary */
  readonly streamingSummary: {
    readonly regionSnapshotIds: readonly string[];
    readonly worldSnapshotId?: string;
  };

  /** Debug snapshot summary */
  readonly debugSummary: {
    readonly snapshotId: string;
    readonly eventCount: number;
  };

  /** Asset binding summary */
  readonly assetBindingSummary: {
    readonly totalBindings: number;
    readonly missingOrFailed: readonly string[];
  };

  /** Engine adapter summary */
  readonly engineApplySummary: {
    readonly adapterId: string;
    readonly instanceCount: number;
  };

  /** USD ↔ PlanGraph ↔ Runtime linkage summary (Phase 20) */
  readonly linkingSummary: {
    readonly samplePlacements: readonly {
      readonly placementId: PlacementId;
      readonly usdPrimPath: string;
      readonly planNodeId: PlanNodeId;
    }[];
    readonly sampleRegions: readonly {
      readonly regionId: string;
      readonly usdPrimPath: string;
      readonly planNodeId: PlanNodeId;
    }[];
  };

  /** Runtime diff summary (Phase 21) */
  readonly diffSummary: {
    readonly addedCount: number;
    readonly removedCount: number;
    readonly updatedCount: number;
    readonly sampleUpdated?: {
      readonly placementId: PlacementId;
      readonly before: unknown;
      readonly after: unknown;
    };
  };

  /** Runtime invariant check summary (Phase 22) */
  readonly invariantSummary: {
    readonly hasErrors: boolean;
    readonly hasWarnings: boolean;
    readonly violationCount: number;
    readonly sampleViolations: readonly {
      readonly id: string;
      readonly severity: string;
      readonly message: string;
    }[];
  };

  /** Runtime invariant check summary (Phase 22) */
  readonly invariantSummary: {
    readonly hasErrors: boolean;
    readonly hasWarnings: boolean;
    readonly violationCount: number;
    readonly sampleViolations: readonly {
      readonly id: string;
      readonly severity: string;
      readonly message: string;
    }[];
  };

  /** Pipeline step summaries */
  readonly steps: readonly PlaygroundStepSummary[];
}

/**
 * Run the complete runtime playground pipeline.
 *
 * Executes:
 * 1. Build world fixture
 * 2. Build RuntimeWorldView
 * 3. Build RuntimeSpatialIndex
 * 4. Region streaming stubs
 * 5. Debug stubs
 * 6. Asset binding stubs
 * 7. No-op engine adapter
 *
 * @returns Promise resolving to PlaygroundResult
 */
export async function runRuntimePlayground(): Promise<PlaygroundResult> {
  const steps: PlaygroundStepSummary[] = [];

  // Step 1: Build world fixture
  steps.push({ name: "Build world fixture" });
  const fixture = buildRuntimePlaygroundFixture();

  // Step 1.5: Run real validation (Phase 19)
  steps.push({ name: "Validate placements and commit plan" });

  // Build baseline validation context
  const ctx: BaselineValidationContext = {
    regions: fixture.regions,
    placements: fixture.placements,
  };

  // Validate base placements
  const baseValidation = validatePlacementsBaseline(ctx);

  // Validate commit plan
  const commitValidation = validateCommitPlanBaseline(ctx, {
    plan: fixture.commitPlan,
    livePlacements: fixture.placements,
  });

  // Merge validation results
  const mergedValidationResult: ValidationResult = {
    issues: [...baseValidation.issues, ...commitValidation.issues],
    isBlocking: baseValidation.isBlocking || commitValidation.isBlocking,
  };

  // Step 2: Build RuntimeWorldView
  steps.push({
    name: "Build RuntimeWorldView",
    details: {
      basePlacementCount: fixture.placements.length,
      commitChangeCount: fixture.commitPlan.changes.length,
      validationIssueCount: mergedValidationResult.issues.length,
    },
  });

  // Build baseline world view (before commit) for diff computation
  const baselineWorldView = buildRuntimeWorldView({
    regions: fixture.regions,
    placements: fixture.placements,
    commitPlan: { changes: [] }, // Empty commit plan
    validationResult: baseValidation, // Only base validation
  });

  // Build world view with commit applied (after)
  const worldView = buildRuntimeWorldView({
    regions: fixture.regions,
    placements: fixture.placements,
    commitPlan: fixture.commitPlan,
    validationResult: mergedValidationResult,
  });

  // Step 2.5: Compute runtime diff (Phase 21)
  steps.push({
    name: "Compute runtime diff",
    details: {
      beforePlacementCount: baselineWorldView.placements.length,
      afterPlacementCount: worldView.placements.length,
    },
  });
  const runtimeDiff = diffRuntimeWorldViews(baselineWorldView, worldView);

  // Count valid/invalid/warning placements
  let validCount = 0;
  let invalidCount = 0;
  let warningCount = 0;
  for (const placement of worldView.placements) {
    if (!placement.isValid) {
      invalidCount++;
    } else if (placement.hasWarnings) {
      warningCount++;
      validCount++;
    } else {
      validCount++;
    }
  }

  // Step 3: Build RuntimeSpatialIndex
  steps.push({
    name: "Build RuntimeSpatialIndex",
    details: {
      placementCount: worldView.placements.length,
    },
  });
  const spatialIndex = buildRuntimeSpatialIndex(worldView);

  // Sample nearest query
  const samplePosition = { x: 5, y: 0, z: 5 };
  const nearestPlacements = spatialIndex.getNearestPlacements(
    samplePosition,
    3
  );

  // Step 3.5: Build Runtime Linking Index (Phase 20)
  steps.push({
    name: "Build Runtime Linking Index",
    details: {
      regionCount: fixture.regions.length,
      placementCount: fixture.placements.length,
    },
  });
  const linkingIndex = buildRuntimeLinkingIndex(
    fixture.regions,
    fixture.placements
  );

  // Step 3.6: Runtime invariants check (Phase 22)
  const invariantReport = checkRuntimeInvariants({
    worldView,
    spatialIndex,
    diff: runtimeDiff,
    validationResult: mergedValidationResult,
    linkingIndex,
  });

  steps.push({
    name: "Runtime invariants check",
    details: {
      violationCount: invariantReport.violations.length,
      hasErrors: invariantReport.hasErrors,
      hasWarnings: invariantReport.hasWarnings,
    },
  });

  // Step 4: Region streaming stubs
  steps.push({ name: "Region streaming stubs" });
  const regionSnapshot = await getRegionSnapshotStub({
    regionId: "region-main",
  });
  const worldSnapshot = await getWorldSnapshotStub({});

  // Step 5: Debug stubs
  steps.push({ name: "Debug snapshot stub" });
  const debugSnapshot = await createDebugSnapshotStub({
    worldView,
  });

  // Step 6: Asset binding stubs
  steps.push({
    name: "Asset binding stubs",
    details: {
      uniqueAssetCount: new Set(worldView.placements.map((p) => p.assetId))
        .size,
    },
  });
  const assetBindings = await buildRuntimeAssetBindingsStub({
    worldView,
  });
  const missingOrFailed = await getMissingOrFailedBindingsStub(assetBindings);

  // Step 7: No-op engine adapter
  steps.push({
    name: "No-op engine adapter",
    details: {
      mode: EngineApplyMode.FULL,
      onlyValid: true,
    },
  });
  const engineAdapter = createNoopEngineAdapter("playground-noop");
  const engineResult = await engineAdapter.applyWorldView(worldView, {
    mode: EngineApplyMode.FULL,
    onlyValid: true,
  });

  // Build linkingSummary (Phase 20)
  const samplePlacementLinkages = Object.values(linkingIndex.byPlacementId)
    .slice(0, 3)
    .map((linkage) => ({
      placementId: linkage.placementId,
      usdPrimPath: linkage.usdPrimPath,
      planNodeId: linkage.planNodeId,
    }));

  const sampleRegionLinkages = Object.values(linkingIndex.byRegionId)
    .slice(0, 1)
    .map((linkage) => ({
      regionId: linkage.regionId,
      usdPrimPath: linkage.usdPrimPath,
      planNodeId: linkage.planNodeId,
    }));

  // Build result
  const result: PlaygroundResult = {
    worldViewSummary: {
      regionCount: fixture.regions.length,
      placementCount: worldView.placements.length,
      validCount,
      invalidCount,
      warningCount,
    },
    spatialIndexSummary: {
      sampleNearestQuery: {
        from: samplePosition,
        returnedPlacementIds: nearestPlacements.map((p) => p.id),
      },
    },
    streamingSummary: {
      regionSnapshotIds: [regionSnapshot.id],
      worldSnapshotId: worldSnapshot.id,
    },
    debugSummary: {
      snapshotId: debugSnapshot.id,
      eventCount: debugSnapshot.events.length,
    },
    assetBindingSummary: {
      totalBindings: assetBindings.bindings.length,
      missingOrFailed: missingOrFailed.map((b) => b.assetId),
    },
    engineApplySummary: {
      adapterId: engineResult.adapterId,
      instanceCount: engineResult.instances.length,
    },
    linkingSummary: {
      samplePlacements: samplePlacementLinkages,
      sampleRegions: sampleRegionLinkages,
    },
    diffSummary: {
      addedCount: runtimeDiff.added.length,
      removedCount: runtimeDiff.removed.length,
      updatedCount: runtimeDiff.updated.length,
      sampleUpdated: runtimeDiff.updated[0]
        ? {
            placementId: runtimeDiff.updated[0].placementId,
            before: runtimeDiff.updated[0].before,
            after: runtimeDiff.updated[0].after,
          }
        : undefined,
    },
    invariantSummary: {
      hasErrors: invariantReport.hasErrors,
      hasWarnings: invariantReport.hasWarnings,
      violationCount: invariantReport.violations.length,
      sampleViolations: invariantReport.violations.slice(0, 3).map((v) => ({
        id: v.id,
        severity: v.severity,
        message: v.message,
      })),
    },
    steps,
  };

  return result;
}

// If invoked directly, run playground and print JSON
if (require.main === module) {
  runRuntimePlayground()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((err) => {
      console.error("Playground error:", err);
      process.exitCode = 1;
    });
}
