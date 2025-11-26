/**
 * Runtime playground harness for Believe's golden path validation.
 *
 * This module executes the entire Believe runtime pipeline (Phases 1–17)
 * in a self-contained, deterministic manner and outputs a JSON summary.
 *
 * Phase 18: Carmack-style golden path harness.
 * Phase 19: Uses real baseline validation rules.
 */

import {
  buildRuntimeAssetBindingsStub,
  getMissingOrFailedBindingsStub,
} from "@/shared/runtime/asset_binding_service";
import { createDebugSnapshotStub } from "@/shared/runtime/debug_service";
import { EngineApplyMode } from "@/shared/runtime/engine_adapter";
import { createNoopEngineAdapter } from "@/shared/runtime/engine_adapter_service";
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
  const worldView = buildRuntimeWorldView({
    regions: fixture.regions,
    placements: fixture.placements,
    commitPlan: fixture.commitPlan,
    validationResult: mergedValidationResult,
  });

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
