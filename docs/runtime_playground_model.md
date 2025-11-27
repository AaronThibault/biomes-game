# Runtime Playground Model

## Overview

This document defines the Runtime Integration Playground & Golden Path Harness for Believe. This is a Carmack-style golden path harness that exercises the entire Believe runtime pipeline (Phases 1–17) in a self-contained, deterministic manner without actual engine integration, ECS, networking, filesystem, DB, or I/O beyond console logging.

## Purpose

### Golden Path Harness

The Runtime Playground provides end-to-end validation of the runtime stack:

**Key Characteristics:**

- **Self-Contained**: No external dependencies or services
- **Deterministic**: Hard-coded fixtures with no randomness
- **End-to-End**: Exercises all runtime phases sequentially
- **Console-Only**: Outputs JSON summary to stdout
- **No Side Effects**: No I/O, networking, or persistence

### Use Cases

**Development Validation:**

- Verify runtime stack coherence
- Test integration between phases
- Catch breaking changes early

**Documentation:**

- Demonstrate runtime pipeline flow
- Provide working examples
- Show expected outputs

**Regression Testing:**

- Deterministic output for comparison
- Catch integration regressions
- Validate contract compatibility

## Golden Path World Scenario

### World Structure

**Regions:**

- `region-main`: Primary region containing all spaces

**Spaces:**

- `space-hub`: Central hub area
- `space-classroom`: Classroom area

**Placements:**

- 5 deterministic placements with:
  - Fixed placementIds
  - Fixed assetIds
  - Fixed transforms (position, rotation, scale)
  - Fixed tags

### Commit Plan

**Changes:**

- **ADD**: New placement to be added
- **UPDATE**: Existing placement to be updated
- **REMOVE**: Existing placement to be removed

### Validation Result (Phase 19)

**Real Validation:**

The playground now uses **real baseline validation rules** instead of synthetic validation results. Validation issues are detected dynamically based on:

- **Structural checks**: Missing IDs, transform sanity, scale bounds
- **Referential checks**: Region existence, commit plan references
- **Spatial checks**: Point-based overlap detection

**Issue Severity:**

- **WARNING**: Non-blocking issues (e.g., unusual scale, overlapping positions)
- **ERROR**: Blocking issues (e.g., missing required fields, invalid references)
- **VALID**: Placements with no issues

## Pipeline Steps

The playground executes the following pipeline sequentially:

### 1. Build World Fixture

**Function:** `buildRuntimePlaygroundFixture()`

**Output:** `RuntimePlaygroundFixture`

**Contains:**

- Regions and spaces
- Asset placements
- Commit plan

> [!NOTE] > **Phase 19 Update**: The fixture no longer includes a hard-coded `ValidationResult`. Validation is now performed dynamically using baseline validation rules.

### 1.5. Run Baseline Validation (Phase 19)

**Functions:**

- `validatePlacementsBaseline()`
- `validateCommitPlanBaseline()`

**Input:** Fixture regions, placements, commit plan

**Output:** Merged `ValidationResult`

**Applies:**

- Structural rules (missing IDs, transform sanity, scale bounds)
- Referential rules (region existence, commit references)
- Spatial rules (point-based overlap detection)

### 2. Build RuntimeWorldView

**Function:** `buildRuntimeWorldView()`

**Input:** Fixture placements, commit plan, validation result

**Output:** `RuntimeWorldView`

**Applies:**

- Commit plan changes
- Validation results
- Effective placements

### 3. Build RuntimeSpatialIndex

**Function:** `buildRuntimeSpatialIndex()`

**Input:** `RuntimeWorldView`

**Output:** `RuntimeSpatialIndex`

**Provides:**

- Spatial queries
- Nearest neighbor search
- AABB queries

### 4. Region Streaming Stubs

**Functions:**

- `getRegionSnapshotStub()`
- `getWorldSnapshotStub()`

**Output:** Snapshot IDs

**Demonstrates:**

- Snapshot creation
- Streaming contracts

### 5. Debug Stubs

**Function:** `createDebugSnapshotStub()`

**Input:** `RuntimeWorldView`

**Output:** `DebugSnapshot`

**Demonstrates:**

- Debug snapshot creation
- Event tracking

### 6. Asset Binding Stubs

**Functions:**

- `buildRuntimeAssetBindingsStub()`
- `getMissingOrFailedBindingsStub()`

**Output:** `RuntimeAssetBindingSet`

**Demonstrates:**

- Asset binding creation
- Missing asset detection

### 7. No-Op Engine Adapter

**Function:** `createNoopEngineAdapter()`

**Method:** `applyWorldView()`

**Options:**

- Mode: FULL
- onlyValid: true

**Output:** `EngineApplyResult`

**Demonstrates:**

- Engine adapter interface
- World view application

### 3.5. Build Runtime Linking Index (Phase 20)

**Function:** `buildRuntimeLinkingIndex()`

**Input:** Fixture regions and placements

**Output:** `RuntimeLinkingIndex`

**Provides:**

- USD prim path derivation for placements, regions, spaces
- PlanGraph node ID derivation for placements, regions, spaces
- Fast lookup by placementId, regionId, spaceId

**Demonstrates:**

- USD ↔ Runtime linkage
- PlanGraph ↔ Runtime linkage
- Introspection infrastructure

### 3.6. Compute Runtime Diff (Phase 21)

**Function:** `diffRuntimeWorldViews()`

**Input:** Baseline world view (before commit), world view (after commit)

**Output:** `RuntimeWorldDiff`

**Provides:**

- Deterministic diff computation
- Added/removed/updated placement detection
- Canonical ordering by placementId

**Demonstrates:**

- Pure diff engine
- Structural comparison
- Deterministic output

- Deterministic output

### 3.7. Runtime Invariant Checks (Phase 22)

**Function:** `checkRuntimeInvariants()`

**Input:** `RuntimeInvariantContext` (WorldView, SpatialIndex, Diff, ValidationResult, LinkingIndex)

**Output:** `RuntimeInvariantReport`

**Provides:**

- Consistency verification across all runtime subsystems
- Detection of impossible states (e.g., spatial index mismatch)
- Validation of diff integrity
- Verification of linkage completeness

**Demonstrates:**

- Self-checking runtime architecture
- Pure, deterministic invariant checking
- "Crash early" (or report early) philosophy for data integrity

- "Crash early" (or report early) philosophy for data integrity

### 3.8. Scenario Generator Integration (Phase 23)

**Function:** `generateRuntimeScenario(spec)`

**Input:** `RuntimeScenarioSpec` (name, counts, flags)

**Output:** `RuntimeScenario` (Regions, Placements, CommitPlan)

**Provides:**

- Deterministic, parameter-driven world generation
- "Golden Path" preset for regression testing
- Configurable complexity for stress testing
- Pure function implementation (no I/O)

**Key Features:**

- Stable IDs (`region-001`, `placement-001`)
- Deterministic transforms
- No synthetic validation generation (relies on Phase 19 baseline)

## Playground Result

The playground outputs a JSON summary with the following structure:

```typescript
interface PlaygroundResult {
  worldViewSummary: {
    regionCount: number;
    placementCount: number;
    validCount: number;
    invalidCount: number;
    warningCount: number;
  };
  spatialIndexSummary: {
    sampleNearestQuery?: {
      from: { x: number; y: number; z: number };
      returnedPlacementIds: readonly PlacementId[];
    };
  };
  streamingSummary: {
    regionSnapshotIds: readonly string[];
    worldSnapshotId?: string;
  };
  debugSummary: {
    snapshotId: string;
    eventCount: number;
  };
  assetBindingSummary: {
    totalBindings: number;
    missingOrFailed: readonly string[];
  };
  engineApplySummary: {
    adapterId: string;
    instanceCount: number;
  };
  linkingSummary: {
    samplePlacements: readonly {
      placementId: PlacementId;
      usdPrimPath: string;
      planNodeId: PlanNodeId;
    }[];
    sampleRegions: readonly {
      regionId: string;
      usdPrimPath: string;
      planNodeId: PlanNodeId;
    }[];
  };
  invariantSummary: {
    hasErrors: boolean;
    hasWarnings: boolean;
    violationCount: number;
    sampleViolations: readonly {
      id: string;
      severity: string;
      message: string;
    }[];
  };
  steps: readonly PlaygroundStepSummary[];
}
```

## Non-Goals

### linkingSummary (Phase 20)

The `linkingSummary` field demonstrates USD ↔ PlanGraph ↔ Runtime linkage:

```json
{
  "linkingSummary": {
    "samplePlacements": [
      {
        "placementId": "placement-001",
        "usdPrimPath": "/World/Regions/region-main/Spaces/space-hub/Placements/Placement_placement-001",
        "planNodeId": "placement-placement-001"
      }
    ],
    "sampleRegions": [
      {
        "regionId": "region-main",
        "usdPrimPath": "/World/Regions/region-main",
        "planNodeId": "region-region-main"
      }
    ]
  }
}
```

## Non-Goals

This playground explicitly **does not** include:

### No Engine Integration

- No Biomes ECS
- No Unreal Engine
- No Unity
- No WebGL/Three.js
- Stub adapters only

### No I/O

- No filesystem access
- No network requests
- No database queries
- Console output only

### No Randomness

- Deterministic fixtures
- Fixed IDs and transforms
- Reproducible output

### No Build System Changes

- No new Bazel targets (optional)
- Run via ts-node
- No build configuration changes

## How to Run

### Via ts-node

```bash
npx ts-node tools/runtime_playground/playground.ts
```

### Expected Output

JSON summary printed to stdout:

```json
{
  "worldViewSummary": {
    "regionCount": 1,
    "placementCount": 5,
    "validCount": 3,
    "invalidCount": 1,
    "warningCount": 1
  },
  "spatialIndexSummary": { ... },
  "streamingSummary": { ... },
  "debugSummary": { ... },
  "assetBindingSummary": { ... },
  "engineApplySummary": { ... },
  "steps": [ ... ]
}
```

### Exit Code

- **0**: Success
- **1**: Error

## Design Principles

1. **Deterministic**: No randomness, reproducible output
2. **Self-Contained**: No external dependencies
3. **End-to-End**: Exercises entire runtime pipeline
4. **Console-Only**: JSON output to stdout
5. **No Side Effects**: Pure in-memory operations

## Implementation Scope

**This Phase (Phase 18):**

- Create runtime playground model documentation
- Create world fixture with deterministic data
- Create playground harness with pipeline execution
- Output JSON summary to console

**Future Enhancements:**

- Add more complex world scenarios
- Add performance benchmarks
- Add visual output (HTML report)
- Add comparison with previous runs
- Add CI integration
- Add property-based testing

## Future Considerations

- **Performance Benchmarks**: Measure pipeline execution time
- **Visual Output**: Generate HTML report with diagrams
- **Scenario Library**: Multiple world scenarios for testing
- **Comparison Tool**: Compare outputs across versions
- **CI Integration**: Run playground in CI pipeline
- **Property-Based Testing**: Generate random valid fixtures
- **Interactive Mode**: REPL for exploring runtime state
