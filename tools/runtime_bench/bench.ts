/**
 * Runtime Performance Sweep & Scaling Harness.
 *
 * Phase 24: Carmack-style performance measurement tool.
 * Executes the full runtime pipeline over deterministic scenarios of varying sizes.
 * Outputs machine-readable JSON timings to stdout.
 */

import { timeBlock } from "@/shared/runtime/perf_utils";
import { diffRuntimeWorldViews } from "@/shared/runtime/runtime_diff";
import { checkRuntimeInvariants } from "@/shared/runtime/runtime_invariants";
import {
  generateRuntimeScenario,
  RuntimeScenarioSpec,
} from "@/shared/runtime/runtime_scenario_generator";
import { buildRuntimeSpatialIndex } from "@/shared/world/runtime_spatial_index_builder";
import { buildRuntimeWorldView } from "@/shared/world/runtime_view_builder";
import {
  BaselineValidationContext,
  validateCommitPlanBaseline,
  validatePlacementsBaseline,
} from "@/shared/world/validation/baseline_rules";
import { ValidationResult } from "@/shared/world/validation/validation";

/**
 * Performance result for a single scenario.
 */
interface ScenarioPerfResult {
  readonly name: string;
  readonly spec: Record<string, unknown>;
  readonly sizes: {
    readonly regionCount: number;
    readonly spaceCount: number;
    readonly placementCountBaseline: number;
    readonly placementCountCommitted: number;
  };
  readonly timings: {
    readonly scenarioGenerationMs: number;
    readonly baselineValidationMs: number;
    readonly baselineWorldViewMs: number;
    readonly committedWorldViewMs: number;
    readonly spatialIndexMs: number;
    readonly diffMs: number;
    readonly invariantsMs: number;
  };
}

/**
 * Complete benchmark result containing all scenarios.
 */
interface BenchResult {
  readonly scenarios: readonly ScenarioPerfResult[];
}

/**
 * Run the benchmark suite.
 */
async function runBenchmarks(): Promise<BenchResult> {
  const scenarios: ScenarioPerfResult[] = [];

  const specs: RuntimeScenarioSpec[] = [
    {
      name: "tiny",
      regionCount: 1,
      spacesPerRegion: 2,
      placementsPerSpace: 5,
      includeCommitPlan: true,
    },
    {
      name: "small",
      regionCount: 3,
      spacesPerRegion: 3,
      placementsPerSpace: 10,
      includeCommitPlan: true,
    },
    {
      name: "medium",
      regionCount: 5,
      spacesPerRegion: 5,
      placementsPerSpace: 40,
      includeCommitPlan: true,
    },
  ];

  for (const spec of specs) {
    // 1. Scenario Generation
    const { durationMs: scenarioGenerationMs, result: scenario } =
      await timeBlock("scenarioGeneration", () =>
        generateRuntimeScenario(spec)
      );

    // 2. Baseline Validation
    const { durationMs: baselineValidationMs, result: mergedValidation } =
      await timeBlock("baselineValidation", () => {
        const ctx: BaselineValidationContext = {
          regions: scenario.regions,
          placements: scenario.placements,
        };
        const baseVal = validatePlacementsBaseline(ctx);
        const commitVal = validateCommitPlanBaseline(ctx, {
          plan: scenario.commitPlan!,
          livePlacements: scenario.placements,
        });
        return {
          issues: [...baseVal.issues, ...commitVal.issues],
          isBlocking: baseVal.isBlocking || commitVal.isBlocking,
        } as ValidationResult;
      });

    // 3. Baseline WorldView (Before Commit)
    const { durationMs: baselineWorldViewMs, result: baselineWorldView } =
      await timeBlock("baselineWorldView", () =>
        buildRuntimeWorldView({
          regions: scenario.regions,
          placements: scenario.placements,
          commitPlan: { changes: [] },
          validationResult: { issues: [], isBlocking: false },
        })
      );

    // 4. Committed WorldView (After Commit)
    const { durationMs: committedWorldViewMs, result: committedWorldView } =
      await timeBlock("committedWorldView", () =>
        buildRuntimeWorldView({
          regions: scenario.regions,
          placements: scenario.placements,
          commitPlan: scenario.commitPlan!,
          validationResult: mergedValidation,
        })
      );

    // 5. Spatial Index
    const { durationMs: spatialIndexMs, result: spatialIndex } =
      await timeBlock("spatialIndex", () =>
        buildRuntimeSpatialIndex(committedWorldView)
      );

    // 6. Runtime Diff
    const { durationMs: diffMs, result: diff } = await timeBlock("diff", () =>
      diffRuntimeWorldViews(baselineWorldView, committedWorldView)
    );

    // 7. Invariants
    const { durationMs: invariantsMs } = await timeBlock("invariants", () =>
      checkRuntimeInvariants({
        worldView: committedWorldView,
        spatialIndex,
        diff,
        validationResult: mergedValidation,
      })
    );

    // Collect results
    let spaceCount = 0;
    for (const region of scenario.regions) {
      spaceCount += region.spaces.length;
    }

    scenarios.push({
      name: spec.name,
      spec: spec as unknown as Record<string, unknown>,
      sizes: {
        regionCount: scenario.regions.length,
        spaceCount,
        placementCountBaseline: baselineWorldView.placements.length,
        placementCountCommitted: committedWorldView.placements.length,
      },
      timings: {
        scenarioGenerationMs,
        baselineValidationMs,
        baselineWorldViewMs,
        committedWorldViewMs,
        spatialIndexMs,
        diffMs,
        invariantsMs,
      },
    });
  }

  return { scenarios };
}

// Execute benchmarks if run directly
if (require.main === module) {
  runBenchmarks()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((err) => {
      console.error("Benchmark failed:", err);
      process.exitCode = 1;
    });
}
