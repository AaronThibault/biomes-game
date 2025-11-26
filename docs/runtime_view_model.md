# Runtime View Model

## Overview

This document defines the runtime-facing read model for Believe. The Runtime View provides a flattened, consumption-ready representation of the current live world state, answering "what is the current world?" in a form suitable for game engines and runtime systems.

This is a contract-level specification defining types and builder functions. No ECS integration, chunk streaming, networking, or Biomes-specific runtime hooks are included in this phase.

## Purpose

### Runtime-Facing Read Model

The Runtime View serves as the bridge between Believe's rich editing and versioning systems and the runtime engine's need for a simple, flattened world state.

**Key Characteristics:**

- **Read-Only**: Runtime View is derived, never modified directly
- **Flattened**: Hierarchical structures (Regions → Spaces → Placements) flattened for efficient access
- **Current State**: Represents the live world after all commits and validations
- **Engine-Ready**: Structured for consumption by game engines, not editing tools

### Separation of Concerns

**Editing Layer** (Phases 1-10):

- Rich hierarchical structures
- Draft sessions and commits
- Validation and collaboration
- Design intent and history
- USD and PlanGraph

**Runtime Layer** (Phase 11):

- Flattened placement list
- Final transforms and metadata
- Validity flags
- Optimized for rendering and simulation

## Inputs (By Phase)

The Runtime View is built from outputs of previous phases:

### Phase 1: Regions & Spaces

**Input:** `Region[]`

**Usage:**

- Included in `RuntimeWorldView.regions`
- Provides spatial partitioning context
- Used for streaming and LOD decisions

### Phase 3: Asset Placements

**Input:** `AssetPlacement[]`

**Usage:**

- Primary source for `RuntimePlacementView[]`
- Each placement mapped to runtime view
- Transform, tags, and metadata preserved

### Phase 6: Commit Plans (Future)

**Input:** `CommitPlan` (optional)

**Future Usage:**

- Apply pending commits to runtime view
- Preview changes before persistence
- Support incremental updates

### Phase 7: Validation Results (Future)

**Input:** `ValidationResult` (optional)

**Future Usage:**

- Set `isValid` and `hasWarnings` flags
- Populate `validationIssueIds`
- Filter invalid placements from runtime

## Outputs

### RuntimePlacementView

A single placement in the runtime world.

**Structure:**

```typescript
interface RuntimePlacementView {
  readonly placementId: PlacementId;
  readonly assetId: string;
  readonly regionId?: string;
  readonly spaceId?: string;
  readonly transform: Transform;
  readonly tags: readonly string[];
  readonly isValid: boolean;
  readonly hasWarnings: boolean;
  readonly validationIssueIds?: readonly string[];
}
```

**Properties:**

- **placementId**: Unique identifier from `AssetPlacement`
- **assetId**: Reference to asset (for loading geometry/materials)
- **regionId/spaceId**: Spatial context (for streaming/LOD)
- **transform**: Final world-space position, rotation, scale
- **tags**: Classification tags (for filtering/queries)
- **isValid**: Whether placement passed validation
- **hasWarnings**: Whether placement has non-blocking issues
- **validationIssueIds**: References to validation issues (if any)

### RuntimeWorldView

The complete runtime world state.

**Structure:**

```typescript
interface RuntimeWorldView {
  readonly regions: readonly Region[];
  readonly placements: readonly RuntimePlacementView[];
}
```

**Properties:**

- **regions**: Array of all regions (spatial partitioning)
- **placements**: Flattened array of all placements

**Benefits:**

- Simple iteration over all placements
- Efficient filtering by region/space
- Direct access without hierarchy traversal

## Builder Function

### buildRuntimeWorldView

Pure function that constructs `RuntimeWorldView` from Believe data.

**Signature:**

```typescript
function buildRuntimeWorldView(
  input: BuildRuntimeWorldViewInput
): RuntimeWorldView;
```

**Input:**

```typescript
interface BuildRuntimeWorldViewInput {
  readonly regions: readonly Region[];
  readonly placements: readonly AssetPlacement[];
  readonly commitPlan?: CommitPlan;
  readonly validationResult?: ValidationResult;
}
```

**Behavior (Current Phase):**

1. Copy regions array to output
2. Map each `AssetPlacement` to `RuntimePlacementView`:
   - Copy placementId, assetId, regionId, spaceId
   - Copy transform and tags
   - Set `isValid: true`, `hasWarnings: false`
   - Set `validationIssueIds: []`
3. Return `RuntimeWorldView`

**Future Behavior:**

- Apply `commitPlan` changes to placements
- Use `validationResult` to set validity flags
- Filter invalid placements (optional)
- Compute derived properties

## Non-Goals

This phase explicitly **does not** include:

### No ECS Integration

- No entity-component-system mapping
- No Biomes-specific entity creation
- No component registration

### No Chunk Streaming

- No spatial indexing
- No chunk-based loading
- No LOD management

### No Networking

- No network serialization
- No client-server sync
- No delta updates

### No Persistence

- No database storage
- No file I/O
- No caching

### No Runtime Hooks

- No Biomes server integration
- No game loop integration
- No rendering pipeline

## Use Cases

### Game Engine Consumption

**Scenario:** Game engine needs current world state for rendering

**Workflow:**

1. Build `RuntimeWorldView` from latest placements
2. Iterate over `placements` array
3. For each placement:
   - Load asset geometry using `assetId`
   - Apply `transform` to position in world
   - Use `tags` for rendering hints (LOD, culling, etc.)
   - Skip if `!isValid`

### Spatial Queries

**Scenario:** Find all placements in a region

**Workflow:**

1. Build `RuntimeWorldView`
2. Filter `placements` by `regionId`
3. Return matching placements

### Validation Preview

**Scenario:** Preview world with validation results applied

**Workflow:**

1. Run validation on placements
2. Build `RuntimeWorldView` with `validationResult`
3. Filter placements where `isValid === true`
4. Render valid placements only

### Commit Preview

**Scenario:** Preview world with pending commit applied

**Workflow:**

1. Create `CommitPlan` from editing session
2. Build `RuntimeWorldView` with `commitPlan`
3. Render preview with commit changes applied
4. User approves or rejects commit

## Design Principles

1. **Pure Functions**: Builder is pure, deterministic, no side effects
2. **Immutable**: All outputs are readonly
3. **Flattened**: No hierarchy traversal required
4. **Validity-Aware**: Validation results integrated
5. **Engine-Agnostic**: No assumptions about runtime architecture

## Implementation Scope

**This Phase (Phase 11):**

- Define `RuntimePlacementView` and `RuntimeWorldView` types
- Implement `buildRuntimeWorldView` builder (stub logic)
- Document runtime view model and use cases

**Future Phases:**

- Apply commit plan logic in builder
- Apply validation result logic in builder
- Add spatial indexing for efficient queries
- Add LOD selection based on placement hints
- Add filtering options (by validity, tags, etc.)
- Integrate with Biomes runtime
- Add incremental update support

## Future Considerations

- **Incremental Updates**: Update runtime view without full rebuild
- **Spatial Indexing**: Efficient region/space queries
- **LOD Selection**: Choose appropriate detail level per placement
- **Culling**: Filter placements outside view frustum
- **Streaming**: Load/unload placements based on proximity
- **Caching**: Cache runtime view for performance
- **Diff Computation**: Compute changes between views
- **Serialization**: Serialize runtime view for network/storage
